import sys
with open('D:/onlinewishes/src/data/templates.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i in range(130, 142):
        print(f"{i+1}: {lines[i].rstrip()}")
