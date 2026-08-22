import os
import re

path = r'frontend/src/pages/dashboard/DashboardOverview.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Tweak card styles to be more modern (glassmorphism/subtle)
old_card = r"const card = \(t\) => \(\{[\s\S]*?boxShadow:[^\n]*\n\}\);"
new_card = '''const card = (t) => ({
  background: t.card,
  border: 1px solid ,
  borderRadius: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
});'''
content = re.sub(old_card, new_card, content)

# 2. Hero header text styles cleanup
content = content.replace("fontSize: 'clamp(28px, 4vw, 44px)'", "fontSize: 'clamp(24px, 5vw, 36px)'")
content = content.replace("letterSpacing: '-0.02em'", "letterSpacing: '-0.03em'")

# 3. Increase padding in cards for breathability
content = content.replace("padding: '1.5rem 1.75rem'", "padding: '2rem'")
content = content.replace("padding: '1.5rem'", "padding: '2rem'")

# 4. Heatmap background gradient smoothing
content = content.replace("['#E9F5EA', '#B7DEC0', '#6EBF86', '#2F9E56', '#1D6B3C']", "['#F3F9F4', '#C3E4CD', '#7DCD95', '#33A85C', '#1D753D']")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
