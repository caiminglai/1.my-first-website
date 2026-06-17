const { prepare } = require("../db");
const cache = require("./cache");

function getScenarios() {
  return cache.remember("scenarios", () => {
    const scenarios = prepare("SELECT 情景ID as id, 场景 as scene, 教训 as lesson FROM 情景还原").all();
    const dialogues = prepare(
      "SELECT 对话ID as dialogue_id, 情景ID as scenario_id, 对话顺序 as line_order, 说话者 as speaker, 对话内容 as text, 高亮内容 as highlight FROM 情景对话 ORDER BY 对话顺序",
    ).all();

    return scenarios.map((s) => ({
      id: s.id,
      scene: s.scene,
      lesson: s.lesson,
      dialogue: dialogues
        .filter((d) => d.scenario_id === s.id)
        .map((d) => ({
          speaker: d.speaker,
          text: d.text,
          highlight: d.highlight,
        })),
    }));
  });
}

module.exports = {
  getScenarios,
};