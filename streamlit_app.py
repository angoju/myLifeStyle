import streamlit as st
import sqlite3
from datetime import datetime, date
import pandas as pd
from pathlib import Path

# =========================
# BASIC CONFIG
# =========================
st.set_page_config(page_title="My Lifestyle App", page_icon="⚡", layout="wide")

DB_PATH = "lifestyle.db"

# =========================
# DB HELPERS
# =========================
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password TEXT NOT NULL
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        category TEXT,
        icon TEXT,
        time TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS habit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        habit_id INTEGER NOT NULL,
        log_date TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(habit_id) REFERENCES habits(id)
    )
    """)
    conn.commit()
    conn.close()

def get_user(email, password=None):
    conn = get_conn()
    cur = conn.cursor()
    if password is None:
        cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    else:
        cur.execute("SELECT * FROM users WHERE email = ? AND password = ?", (email, password))
    row = cur.fetchone()
    conn.close()
    return row

def create_user(name, email, password):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, password))
    conn.commit()
    user_id = cur.lastrowid
    conn.close()
    return user_id

def get_habits(user_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM habits WHERE user_id = ? ORDER BY time", (user_id,))
    rows = cur.fetchall()
    conn.close()
    return rows

def add_habit(user_id, title, subtitle, category, icon, time_str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO habits (user_id, title, subtitle, category, icon, time)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, title, subtitle, category, icon, time_str))
    conn.commit()
    conn.close()

def delete_habit(user_id, habit_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM habit_logs WHERE user_id = ? AND habit_id = ?", (user_id, habit_id))
    cur.execute("DELETE FROM habits WHERE user_id = ? AND id = ?", (user_id, habit_id))
    conn.commit()
    conn.close()

def log_status(user_id, habit_id, status):
    today_str = date.today().isoformat()
    conn = get_conn()
    cur = conn.cursor()
    # Remove existing log for today
    cur.execute("""
        DELETE FROM habit_logs
        WHERE user_id = ? AND habit_id = ? AND log_date = ?
    """, (user_id, habit_id, today_str))
    # Insert new log
    cur.execute("""
        INSERT INTO habit_logs (user_id, habit_id, log_date, status)
        VALUES (?, ?, ?, ?)
    """, (user_id, habit_id, today_str, status))
    conn.commit()
    conn.close()

def get_today_logs(user_id):
    today_str = date.today().isoformat()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM habit_logs
        WHERE user_id = ? AND log_date = ?
    """, (user_id, today_str))
    rows = cur.fetchall()
    conn.close()
    return {row["habit_id"]: row["status"] for row in rows}

def get_history_df(user_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT hl.log_date, h.title, hl.status
        FROM habit_logs hl
        JOIN habits h ON hl.habit_id = h.id
        WHERE hl.user_id = ?
        ORDER BY hl.log_date DESC
    """, (user_id,))
    rows = cur.fetchall()
    conn.close()
    if not rows:
        return pd.DataFrame(columns=["Date", "Habit", "Status"])
    data = [(r["log_date"], r["title"], r["status"]) for r in rows]
    return pd.DataFrame(data, columns=["Date", "Habit", "Status"])

def get_stats_df(user_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT log_date,
               SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as completed,
               COUNT(*) as total
        FROM habit_logs
        WHERE user_id = ?
        GROUP BY log_date
        ORDER BY log_date
    """, (user_id,))
    rows = cur.fetchall()
    conn.close()
    if not rows:
        return pd.DataFrame(columns=["Date", "Completed %"])
    data = []
    for r in rows:
        pct = int(100 * r["completed"] / r["total"]) if r["total"] else 0
        data.append((r["log_date"], pct))
    return pd.DataFrame(data, columns=["Date", "Completed %"])

# =========================
# DEFAULT HABITS FOR NEW USER
# =========================
DEFAULT_HABITS = [
    ("Pepper + Ginger Water", "Warm water with spices", "MORNING", "🍵", "05:40"),
    ("Kashmiri Garlic + Honey", "2 cloves", "SUPPLEMENTS", "🧄", "05:45"),
    ("Brazil Nut", "Eat 1 nut", "SUPPLEMENTS", "🌰", "05:50"),
    ("Shilajit Drops", "Mix in warm water", "SUPPLEMENTS", "💧", "05:55"),
    ("Physics Study", "Focus on mechanics", "EDUCATION", "📘", "16:00"),
    ("Maths Practice", "Calculus problems", "EDUCATION", "📗", "17:00"),
]

def create_default_habits_for_user(user_id):
    if get_habits(user_id):
        return
    for title, subtitle, cat, icon, t in DEFAULT_HABITS:
        add_habit(user_id, title, subtitle, cat, icon, t)

# =========================
# SESSION STATE
# =========================
if "user" not in st.session_state:
    st.session_state.user = None
if "active_page" not in st.session_state:
    st.session_state.active_page = "Home"

# =========================
# CSS FOR UI
# =========================
st.markdown("""
<style>
.card {
    border-radius: 18px;
    padding: 18px;
    background: white;
    border: 1px solid #e8e8e8;
    margin-bottom: 16px;
    box-shadow: 0px 2px 8px rgba(0,0,0,0.05);
}
.card-category {
    background: #EEE4FF;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    color: #5A0CE8;
    font-weight: 600;
}
.card-time {
    color: #777;
    font-size: 13px;
}
.quote-box {
    background: linear-gradient(90deg, #6A4DFD, #A15CF6);
    padding: 22px;
    border-radius: 16px;
    color: white;
    margin-top: 10px;
}
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 14px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: space-around;
    font-size: 18px;
}
.progress-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 6px solid #e7e7e7;
    border-top: 6px solid #6A4DFD;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
}
</style>
""", unsafe_allow_html=True)

# =========================
# AUTH SCREENS
# =========================
def auth_screen():
    st.title("⚡ My Lifestyle App")
    tab_login, tab_signup = st.tabs(["Login", "Sign Up"])

    with tab_login:
        st.subheader("Login with Email")
        email = st.text_input("Email", key="login_email")
        password = st.text_input("Password", type="password", key="login_password")
        if st.button("Login"):
            row = get_user(email, password)
            if row:
                st.session_state.user = dict(row)
                create_default_habits_for_user(row["id"])
                st.experimental_rerun()
            else:
                st.error("Invalid email or password")

        st.write("or")
        st.info("Google / Apple sign-in can be added with OAuth setup on Streamlit Cloud.")
        st.button("🔒 Continue with Google (placeholder)", disabled=True)
        st.button("🍎 Continue with Apple (placeholder)", disabled=True)

    with tab_signup:
        st.subheader("Create a new account")
        name = st.text_input("Name", key="signup_name")
        email2 = st.text_input("Email ", key="signup_email")
        pw1 = st.text_input("Password ", type="password", key="signup_pw1")
        pw2 = st.text_input("Confirm Password", type="password", key="signup_pw2")
        if st.button("Sign Up"):
            if pw1 != pw2:
                st.error("Passwords do not match")
            elif not email2 or not pw1:
                st.error("Email and password required")
            elif get_user(email2) is not None:
                st.error("User already exists")
            else:
                user_id = create_user(name, email2, pw1)
                create_default_habits_for_user(user_id)
                st.success("Account created! Please login from Login tab.")

# =========================
# HOME PAGE
# =========================
def habit_card(habit, status_today):
    done = status_today == "done"
    today_str = datetime.now().strftime("%I:%M %p")
    title = habit["title"]
    subtitle = habit["subtitle"] or ""
    category = habit["category"] or ""
    icon = habit["icon"] or ""
    time_str = habit["time"] or today_str

    col = st.container()
    with col:
        html = f"""
        <div class="card">
            <h4>{icon} {title}</h4>
            <p style="margin-top:-8px;color:#666;">{subtitle}</p>
            <span class="card-category">{category}</span>
            <p class="card-time">⏰ {time_str}</p>
        </div>
        """
        st.markdown(html, unsafe_allow_html=True)
        c1, c2 = st.columns(2)
        with c1:
            if st.button("✅ Done", key=f"done_{habit['id']}"):
                log_status(st.session_state.user["id"], habit["id"], "done")
                st.experimental_rerun()
        with c2:
            if st.button("↩️ Undo", key=f"undo_{habit['id']}"):
                log_status(st.session_state.user["id"], habit["id"], "pending")
                st.experimental_rerun()
        if done:
            st.success("Completed today")

def home_page():
    user = st.session_state.user
    today_str = datetime.now().strftime("%A, %B %d")
    st.write(f"### {today_str}")
    st.write(f"## Hello, {user['name'] or 'friend'} 👋")

    # Progress
    habits = get_habits(user["id"])
    logs = get_today_logs(user["id"])
    total = len(habits)
    completed = sum(1 for h in habits if logs.get(h["id"]) == "done")
    pct = int(100 * completed / total) if total else 0

    col_progress, _ = st.columns([1, 9])
    with col_progress:
        st.markdown(f'<div class="progress-circle">{pct}%</div>', unsafe_allow_html=True)

    st.markdown("""
    <div class="quote-box">
    <b>"The truest discipline is found not in constant exertion, but in the wisdom of deliberate rest,
    where recovery replenishes the spirit for the journey ahead."</b>
    </div>
    """, unsafe_allow_html=True)

    st.write("## Today's Routine")

    col1, col2 = st.columns(2)
    for i, habit in enumerate(habits):
        status_today = logs.get(habit["id"], "pending")
        if i % 2 == 0:
            with col1:
                habit_card(habit, status_today)
        else:
            with col2:
                habit_card(habit, status_today)

# =========================
# HISTORY PAGE
# =========================
def history_page():
    st.write("## 📅 History")
    df = get_history_df(st.session_state.user["id"])
    if df.empty:
        st.info("No history yet. Complete some habits on the Home page.")
        return
    date_filter = st.date_input("Filter by date (optional)", value=None)
    if isinstance(date_filter, date):
        df = df[df["Date"] == date_filter.isoformat()]
    st.dataframe(df, use_container_width=True)

# =========================
# STATS PAGE
# =========================
def stats_page():
    st.write("## 📊 Stats")
    df = get_stats_df(st.session_state.user["id"])
    if df.empty:
        st.info("No stats yet. When you complete habits, stats will appear here.")
        return
    df_plot = df.set_index("Date")
    st.line_chart(df_plot["Completed %"])
    st.bar_chart(df_plot["Completed %"])

# =========================
# SETTINGS PAGE
# =========================
def settings_page():
    user = st.session_state.user
    st.write("## ⚙️ Settings")

    st.subheader("Profile")
    st.write(f"Name: **{user['name']}**")
    st.write(f"Email: **{user['email']}**")

    if st.button("Logout"):
        st.session_state.user = None
        st.experimental_rerun()

    st.write("---")
    st.subheader("Manage Habits")

    habits = get_habits(user["id"])
    for h in habits:
        col1, col2 = st.columns([4, 1])
        with col1:
            st.write(f"**{h['title']}** — {h['time']} ({h['category']})")
        with col2:
            if st.button("Delete", key=f"del_{h['id']}"):
                delete_habit(user["id"], h["id"])
                st.experimental_rerun()

    st.write("### Add New Habit")
    with st.form("add_habit_form"):
        title = st.text_input("Title")
        subtitle = st.text_input("Subtitle", "")
        category = st.text_input("Category (e.g. MORNING, SUPPLEMENTS)")
        icon = st.text_input("Icon (emoji, e.g. 🍵)", value="✅")
        time_str = st.text_input("Time (HH:MM, 24h)", value="06:00")
        submitted = st.form_submit_button("Add Habit")
        if submitted:
            if not title:
                st.error("Title is required.")
            else:
                add_habit(user["id"], title, subtitle, category, icon, time_str)
                st.success("Habit added!")
                st.experimental_rerun()

# =========================
# BOTTOM NAVIGATION
# =========================
def bottom_nav():
    cols = st.columns(4)
    labels = ["Home", "History", "Stats", "Settings"]
    icons = ["🏠", "📅", "📊", "⚙️"]
    for i, (lab, icon) in enumerate(zip(labels, icons)):
        if cols[i].button(f"{icon} {lab}", key=f"nav_{lab}"):
            st.session_state.active_page = lab
            st.experimental_rerun()

    st.markdown("""
    <div class="bottom-nav">
        <span>🏠 Home</span>
        <span>📅 History</span>
        <span>📊 Stats</span>
        <span>⚙️ Settings</span>
    </div>
    """, unsafe_allow_html=True)

# =========================
# MAIN APP
# =========================
def main():
    init_db()

    if st.session_state.user is None:
        auth_screen()
        return

    page = st.session_state.active_page

    if page == "Home":
        home_page()
    elif page == "History":
        history_page()
    elif page == "Stats":
        stats_page()
    elif page == "Settings":
        settings_page()

    bottom_nav()

if __name__ == "__main__":
    main()
