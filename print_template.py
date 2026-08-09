import sys
with open('D:/onlinewishes/src/types.ts', 'r', encoding='utf-8') as f:
    for line in f:
        if 'export interface Template ' in line or 'export type Template ' in line or 'export interface Template{' in line:
            print("Found Template definition")
