import sys
with open('D:/onlinewishes/src/data/templates.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines[130:150], 131):
        print(f"{i}: {line.rstrip()}")
