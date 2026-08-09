import sys
with open('D:/onlinewishes/src/types.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if 'export interface Template {' in line:
            for j in range(i, i+15):
                print(f"{j+1}: {lines[j].rstrip()}")
            break
