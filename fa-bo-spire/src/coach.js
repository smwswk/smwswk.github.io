import { CARDS, RELICS, getEnergyCost } from "./rules.js";

export function recommendCardIndexes({ hand, playerQi, playerEnergy = 3, enemyIntent }) {
  const cards = hand.map((id, index) => ({ id, index, card: CARDS[id] }));
  const playable = cards.filter(
    ({ card }) => (card.cost ?? 0) <= playerQi && getEnergyCost(card) <= playerEnergy
  );

  if (enemyIntent?.type === "charge") {
    const wave = playable
      .filter(({ card }) => card.type === "wave")
      .sort((a, b) => scoreWave(b.card, enemyIntent) - scoreWave(a.card, enemyIntent))[0];
    if (wave) return [wave.index];
  }

  if (enemyIntent?.type === "wave") {
    const guards = playable
      .filter(({ card }) => card.type === "guard" || (card.type === "skill" && card.block))
      .sort((a, b) => (b.card.block ?? 0) - (a.card.block ?? 0));
    const picked = [];
    let block = 0;
    let energy = playerEnergy;
    for (const item of guards) {
      const energyCost = getEnergyCost(item.card);
      if (energyCost > energy) continue;
      picked.push(item.index);
      energy -= energyCost;
      block += item.card.block ?? 0;
      if (block >= (enemyIntent.damage ?? 0)) break;
    }
    if (picked.length) return picked;
  }

  if (enemyIntent?.type === "guard") {
    const charge = playable
      .filter(({ card }) => card.type === "charge" || card.reveal)
      .sort((a, b) => (b.card.qi ?? 0) - (a.card.qi ?? 0))[0];
    if (charge) return [charge.index];
  }

  const freeCharge = playable.find(({ card }) => card.type === "charge");
  if (freeCharge) return [freeCharge.index];
  return playable.slice(0, 1).map(({ index }) => index);
}

export function buildSelectionPreview({
  cardIds,
  playerQi,
  playerEnergy = 3,
  enemyIntent,
  relicIds = []
}) {
  let qi = playerQi;
  let energy = playerEnergy;
  let block = 0;
  let waveDamage = 0;
  let pierce = false;
  let reveal = false;
  const lines = [];

  for (const id of cardIds) {
    const card = CARDS[id];
    if (!card) continue;
    const energyCost = getEnergyCost(card);
    if (energyCost > energy) {
      lines.push(`${card.name}能量不够。`);
      continue;
    }
    const cost = card.cost ?? 0;
    if (cost > qi) {
      lines.push(`${card.name}气不够。`);
      continue;
    }
    energy -= energyCost;
    qi -= cost;
    if (card.type === "charge") {
      const bonus = relicIds.includes("red_scarf") ? RELICS.red_scarf.bonusCharge : 0;
      qi += (card.qi ?? 0) + bonus;
    }
    if (card.type === "guard") {
      block += card.block ?? 0;
    }
    if (card.type === "skill") {
      block += card.block ?? 0;
      qi += card.qi ?? 0;
      reveal ||= Boolean(card.reveal);
    }
    if (card.type === "wave") {
      const hits = card.hits ?? 1;
      let damage = (card.damage ?? 0) * hits;
      if (card.interruptBonus && enemyIntent?.type === "charge") {
        damage += card.interruptBonus;
      }
      waveDamage += damage;
      pierce ||= Boolean(card.pierce);
      qi += card.qi ?? 0;
    }
  }

  return {
    energyAfter: Math.max(0, energy),
    qiAfter: Math.max(0, qi),
    block,
    waveDamage,
    pierce,
    reveal,
    read: buildRead({ enemyIntent, block, waveDamage, pierce, reveal }),
    lines
  };
}

export function describeCombatGoal(enemyIntent) {
  if (!enemyIntent) {
    return "先读姿态，再选牌。攒气、防御、发波每回合同时结算。";
  }
  if (enemyIntent.type === "charge") {
    return "对面大概率在攒气：发波能打断，没波就跟着攒。";
  }
  if (enemyIntent.type === "wave") {
    return "对面要出波：优先叠挡，挡住后再找机会攒气反打。";
  }
  if (enemyIntent.type === "guard") {
    return "对面偏防守：别把普通波撞在挡上，趁机攒气或读心。";
  }
  return "选择 1-3 张牌，再点结束回合。";
}

function scoreWave(card, enemyIntent) {
  return (
    (card.damage ?? 0) * (card.hits ?? 1) +
    (card.interruptBonus && enemyIntent?.type === "charge" ? card.interruptBonus : 0) +
    (card.pierce ? 3 : 0)
  );
}

function buildRead({ enemyIntent, block, waveDamage, pierce, reveal }) {
  if (!enemyIntent) return "选择卡牌后这里会显示本回合预览。";
  if (reveal) return "读心会揭示真实动作，适合不确定时先看牌。";
  if (enemyIntent.type === "charge" && waveDamage > 0) {
    return "这手能打断攒气，是赚节奏的打法。";
  }
  if (enemyIntent.type === "wave" && block >= (enemyIntent.damage ?? 0)) {
    return "挡足了，预计不会受伤。";
  }
  if (enemyIntent.type === "wave" && block > 0) {
    return "能减伤，但可能还会掉血。";
  }
  if (enemyIntent.type === "guard" && waveDamage > 0 && !pierce) {
    return "普通波可能撞防，除非只是想消耗对面。";
  }
  if (enemyIntent.type === "guard" && pierce) {
    return "破防波能穿过防御。";
  }
  if (waveDamage > 0) return "这回合会主动发波。";
  if (block > 0) return "这回合偏防守。";
  return "这回合偏攒气，为后续大波做准备。";
}
