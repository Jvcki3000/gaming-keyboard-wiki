# -*- coding: utf-8 -*-
import io

path = r"C:\Users\foshanwuyanzu\Desktop\gkeyboardwiki\product.md"

with io.open(path, "r", encoding="utf-8") as f:
    text = f.read()

repl = [
    # 型号二级标题：去掉括号里的冗余中文/英文别名
    ("## ROG 魔导士 Ace HFX（Falchion Ace HFX）", "## ROG 魔导士 Ace HFX"),
    ("## ROG 夜魔 EXTREME（Azoth Extreme）", "## ROG 夜魔 EXTREME"),
    ("## ROG 夜魔 98 HE（Azoth 98 HE）", "## ROG 夜魔 98 HE"),
    ("## ROG 夜魔 标准版（Azoth）", "## ROG 夜魔 标准版"),
    ("## Razer BlackWidow（黑寡妇蜘蛛）系列", "## Razer BlackWidow 系列"),
    ("## Razer DeathStalker（噬魂金蝎）系列", "## Razer DeathStalker 系列"),
    ("## MCHOSE Ace 75（迈从 Ace 75）", "## MCHOSE Ace 75"),
    ("## MCHOSE Ace 60（迈从 Ace 60）", "## MCHOSE Ace 60"),
    ("## MCHOSE Ace 68 Turbo（迈从 Ace 68 Turbo）", "## MCHOSE Ace 68 Turbo"),
    ("## MCHOSE God 60（迈从 God 60）", "## MCHOSE God 60"),
    ("## ATK RS7 Turbo（艾泰克 RS7 Turbo）", "## ATK RS7 Turbo"),
    # 索引锚点：去掉 Razer 多写的连字符中文别名
    ("](#razer-blackwidow-黑寡妇蜘蛛-系列)", "](#razer-blackwidow-系列)"),
    ("](#razer-deathstalker-噬魂金蝎-系列)", "](#razer-deathstalker-系列)"),
]

for old, new in repl:
    cnt = text.count(old)
    if cnt == 0:
        print("WARN NOT FOUND:", old)
    else:
        text = text.replace(old, new)
        print("OK replaced %dx: %s" % (cnt, old[:28]))

with io.open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("DONE")
