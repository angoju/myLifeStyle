import streamlit as st
import datetime
import pandas as pd

st.set_page_config(page_title="My Lifestyle Dashboard", page_icon="⚡", layout="wide")

# -----------------------------
# Header
# -----------------------------
st.title("⚡ My Lifestyle Dashboard")
st.write("Welcome Janardhan! Track your habits, supplements, and daily routine easily.")

# -----------------------------
# Today’s Routine Section
# -----------------------------
st.subheader("📅 Today's Routine")

today_habits = [
    "Pepper + Ginger Water (5:30 AM)",
    "Kashmiri Garlic + Honey",
    "Brazil Nut",
    "Shilajit Drops",
    "Food Reminder (7:00 PM)",
    "Shilajit Resin (8:30 PM)",
    "Ashwagandha Tablet (9:15 PM)"
]

col1, col2 = st.columns(2)

for i, habit in enumerate(today_habits):
    if i % 2 == 0:
        with col1:
            st.checkbox(habit, key=habit)
    else:
        with col2:
            st.checkbox(habit, key=habit)

# -----------------------------
# Weekly Progress Dummy Data
# -----------------------------
st.subheader("📊 Weekly Habit Progress")

data = {
    "Day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "Completed (%)": [85, 70, 90, 75, 80, 95, 88]
}

df = pd.DataFrame(data)

st.bar_chart(df, x="Day", y="Completed (%)")

# -----------------------------
# Supplements Log
# -----------------------------
st.subheader("💊 Supplements Log")

log = st.text_area("Add notes for today:", placeholder="Example: Took Shilajit at 8:30 PM...")

if st.button("Save Log"):
    st.success("Log saved! (This is demo — backend connection can be added later.)")

# -----------------------------
# Footer
# -----------------------------
st.write("---")
st.write("Made with ❤️ by Janardhan")
