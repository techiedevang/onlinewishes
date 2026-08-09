import sys
with open('D:/onlinewishes/src/types.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i in range(50, 75):
        print(f"{i+1}: {lines[i].rstrip()}")
