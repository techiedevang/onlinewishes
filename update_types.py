import re

with open('D:/onlinewishes/src/types.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Update OccasionType
old_occasion = "export type OccasionType = 'bestie' | 'girlfriend' | 'sister' | 'birthday' | 'anniversary' | 'wedding' | 'friendship';"
new_occasion = "export type OccasionType = 'bestie' | 'girlfriend' | 'sister' | 'birthday' | 'anniversary' | 'wedding' | 'friendship' | 'valentine' | 'rose_day' | 'propose_day' | 'chocolate_day' | 'teddy_day' | 'promise_day' | 'hug_day' | 'kiss_day' | 'slap_day' | 'kick_day' | 'perfume_day' | 'flirt_day' | 'confession_day' | 'missing_day' | 'breakup_day';"
content = content.replace(old_occasion, new_occasion)

# Update interactivePreviewType
old_preview = "  interactivePreviewType: 'box21' | 'love_story' | 'bestie_wall' | 'sister_tree' | 'birthday_party' | 'retro_arcade' | 'galaxy' | 'editorial' | 'vintage' | 'friendship_greet' | 'sorry_apology';"
new_preview = "  interactivePreviewType: 'box21' | 'love_story' | 'bestie_wall' | 'sister_tree' | 'birthday_party' | 'retro_arcade' | 'galaxy' | 'editorial' | 'vintage' | 'friendship_greet' | 'sorry_apology' | 'rose_day_view' | 'propose_day_view' | 'valentine_day_view' | 'friendship_bond_view' | 'chocolate_day_view' | 'teddy_day_view' | 'promise_day_view' | 'hug_day_view' | 'kiss_day_view' | 'birthday_balloon_view' | 'anniversary_garden_view' | 'breakup_heal_view' | 'wedding_invite_view';"
content = content.replace(old_preview, new_preview)

# Add Valentine Day fields to UserCustomization
old_fields = "  finalBgGradient?: string;\n}"
new_fields = """  finalBgGradient?: string;

  // Valentine Week specific
  valentineDay?: string; // 'rose' | 'propose' | 'chocolate' | 'teddy' | 'promise' | 'hug' | 'kiss' | 'valentine'
  roseColor?: string; // for Rose Day
  proposalQuestion?: string; // for Propose Day  
  loveMeter?: number; // 0-100 love meter percentage
  reasonsILoveYou?: Array<{ id: string; reason: string }>; // list of love reasons
  coupleNickname?: string; // couple's nickname
  firstMeetDate?: string; // anniversary/first meet date
  relationshipDuration?: string; // "2 years 3 months"
}"""
content = content.replace(old_fields, new_fields)

with open('D:/onlinewishes/src/types.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('types.ts updated successfully')
