import sys
with open('D:/onlinewishes/src/data/templates.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for line in lines[-20:]:
        print(line.rstrip())
