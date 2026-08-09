import sys
with open('D:/onlinewishes/src/data/templates.ts', 'r', encoding='utf-8') as f:
    for i in range(10):
        print(f.readline().rstrip())
