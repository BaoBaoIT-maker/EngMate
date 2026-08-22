import os
import re

src_dir = r'frontend/src'

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.jsx', '.js', '.tsx', '.ts')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            original = content

            # Match fontFamily: "..." or fontFamily: '...' (including nested quotes)
            content = re.sub(r"fontFamily:\s*('[^']*'|\"[^\"]*\")\s*,?\s*", '', content)

            # DashboardLayout labels
            if file == 'DashboardLayout.jsx':
                content = content.replace("label: 'Flashcards'", "label: 'Thẻ từ vựng'")
                content = content.replace("label: 'Mini-games'", "label: 'Trò chơi'")
                content = content.replace("label: 'AI Conversation'", "label: 'Luyện giao tiếp'")
                content = content.replace("label: 'AI Coach'", "label: 'Luyện giao tiếp'")

            # DashboardOverview replacements
            if file == 'DashboardOverview.jsx':
                content = content.replace("Garden Growth", "Khu vườn tri thức")
                
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {path}")
