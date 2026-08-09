# -*- coding: utf-8 -*-
import sys

with open('D:/onlinewishes/src/data/templates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

split_str = '  // === VALENTINE WEEK TEMPLATES ===\n'
parts = content.split(split_str)
if len(parts) == 2:
    # Get the part before
    before = parts[0]
    # The part after contains the newly inserted templates and ends with ];
    after = parts[1]
    
    # We want to restore the   }\n]; where it was.
    # The insertion replaced   }\n]; with   },\n + split_str +   {\n... \n  }\n];
    # So efore ends with   },
    if before.endswith('  },\n'):
        before = before[:-4] + '  }\n];\n'
    
    # Now we have fter, which is the string of new templates ending with ];
    # We need to insert this at the VERY END of efore.
    # Wait, the true end of the file is at the end of efore?
    # No, efore contains the rest of the file!
    # Wait, if old_end matched EARLY in the file, then efore is just the first part of the file, up to the first   }\n];
    # And fter contains my templates, ending in ];, AND THEN WHAT?
    # Wait, eplace in python replaces ALL occurrences by default!
    pass

