#!/usr/bin/env bash
# anonymize.sh — 把 case2 跑出来的 dossier_deep_*.html / *.md
# 替换成虚拟 handle，用于公开发布前的脱敏。
#
# 用法：
#   bash anonymize.sh dossier_deep_real.html dossier_deep_demo.html
#   bash anonymize.sh 全网社交性格分析_快速版.md /tmp/quick_demo.md
#
# 设计原则：
#   1) 只做"标识符"替换——不改内容措辞、不改数字
#   2) handle / id / 真名 三类全部覆盖
#   3) 出现次数同步替换，不留死角（grep 自检）
#   4) 用户可自由扩展 SED 规则数组

set -e

if [ $# -lt 2 ]; then
  echo "用法：$0 <input> <output>"
  echo "可选环境变量：HANDLE_FROM='realname' HANDLE_TO='virtual_panda' bash $0 ..."
  exit 1
fi

IN="$1"; OUT="$2"

# ============================================
# 默认替换规则（按需扩展）
# ============================================
# 真实 handle  → 虚拟 handle
# 真实姓名     → 虚拟姓名
# 真实数字 ID  → 模糊化数字
SED_RULES=(
  # GitHub / Twitter / 学术线
  's/shenhao-stu/virtual-panda/g'
  's/shenhao-63/virtual-panda/g'
  's/Shen Hao/Virtual Panda/g'
  's/HAOSHEN142751/VPResearch/g'
  's/@HAOSHEN142751/@VPResearch/g'

  # 论坛 / B站 / 江湖线
  's/ozer_23/nightduck_23/g'
  's/ozer23/nightduck23/g'
  's/ozer/nightduck/g'
  's/是ozer鸭/夜鸭子/g'
  's/是ozer鸭-不吃香菜版/夜鸭子·非典型/g'
  's/不吃香菜版/非典型/g'

  # 数字 ID（用户 uid / 真爱粉编号 等可识别个人的数字）
  's/399110248/100000000/g'
  's/235830/999000/g'

  # 仓库名 / 自创品牌
  's/ohmycaptcha/mycaptcha-svc/g'
  's/openclaw-agents/openpaw-agents/g'
  's/openclaw-academic-radar/openpaw-academic-radar/g'
  's/openclaw/openpaw/g'

  # shenhao 残留（替代名后缀残留）
  's/shenhao/virtual_panda/g'
  's/是nightduck鸭/夜鸭子/g'
  's/不吃香菜/非典型/g'

  # 偶像 / 二次元（默认启用）
  's/EveOneCat2/AnimeArtist01/g'

  # 学校 / 机构（默认启用更彻底的脱敏）
  's/Fudan University/A Tier-1 University/g'
  's/复旦大学博士/某 R1 高校博士/g'
  's/复旦团队研发/某团队研发/g'
  's/复旦 PhD/某 R1 高校 PhD/g'
  's/复旦/某 R1 高校/g'
  's/Fudan/Sample Univ/g'
  's/上财/本校/g'
  's/SUFE/CAMPUS/g'

  # 元信息文案（让 demo 文件一眼能识别为虚构）
  's/CASE# 2026-04-25 · CONFIDENTIAL · SUBJECT SELF-AUTHORIZED/CASE# 2026-04-25 · DEMO · FICTIONAL · NOT A REAL PERSON/g'
  's/CONFIDENTIAL · SUBJECT SELF-AUTHORIZED/DEMO · FICTIONAL · NOT A REAL PERSON/g'
)

# ============================================
# 应用规则
# ============================================
TMP="$(mktemp)"
cp "$IN" "$TMP"
for rule in "${SED_RULES[@]}"; do
  sed -i "$rule" "$TMP"
done

# ============================================
# 自检：grep 残留真实 handle
# ============================================
LEAKS=$(grep -nE "shenhao|ozer|HAOSHEN|399110248|ohmycaptcha|openclaw|EveOneCat" "$TMP" || true)
if [ -n "$LEAKS" ]; then
  echo "⚠️  以下行可能仍含真实标识，请人工核查："
  echo "$LEAKS"
fi

mv "$TMP" "$OUT"
echo "✅  写入 $OUT"
echo "    （规则数 ${#SED_RULES[@]}，建议 diff 复核）"
