(function() {
  "use strict";

  /* ============================================
   * 痕迹 (henji) - 角色人生轨迹与平行时空
   * ============================================ */

  var PLUGIN_ID = "henji";
  var APP_ID = "henji-home";
  var ROOT_CLASS = "roche-plugin-henji";

  /* ─── SVG 图标库 ─── */
  var ICONS = {
    back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    plus: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="6" x2="14" y2="22"/><line x1="6" y1="14" x2="22" y2="14"/></svg>',
    chevronRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    refresh: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>',
    sparkle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    edit: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    fastForward: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>',
    switchIcon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>',
    user: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  };

  var EMOTION_COLORS = {
    "温柔记忆": { bg: "#fbe9f0", fg: "#b8547d", dot: "#d98cae" },
    "创伤记忆": { bg: "#fbe9e9", fg: "#b8433c", dot: "#d9756e" },
    "普通记忆": { bg: "#f0f0f2", fg: "#6e6e73", dot: "#b0b0b6" },
    "高光记忆": { bg: "#fbf1dc", fg: "#9c7a1f", dot: "#d9b354" }
  };
  function getEmotionColor(tag) { return EMOTION_COLORS[tag] || EMOTION_COLORS["普通记忆"]; }

  /* ─── 状态 ─── */
  var state = {
    roche: null,
    containerEl: null,
    styleEl: null,
    view: "charList",
    viewStack: [],
    characters: [],
    activePersona: null,
    currentCharId: null,
    currentEntryId: null,
    currentSessionId: null,
    timelines: {},
    parallelIndex: [],
    parallelSessions: {},
    selectedSliceIds: [],
    userPresentDraft: true,
    actionMode: false,
    modalOpen: null,
    timelineBusy: false,
    entryBusy: false,
    parallelBusy: false
  };

  /* ─── 工具函数 ─── */
  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function generateId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 9); }
  function formatTime(ts) {
    var d = ts ? new Date(ts) : new Date();
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    var mm = m < 10 ? "0" + m : "" + m;
    return h12 + ":" + mm + " " + ampm;
  }
  function toast(msg) {
    if (state.roche && state.roche.ui && state.roche.ui.toast) { try { state.roche.ui.toast(msg); return; } catch (e) {} }
    console.log("[henji] " + msg);
  }
  function debugLog(msg) { console.log("[henji] " + msg); }

  /* ─── 存储 ─── */
  function tlKey(charId) { return "timeline_" + charId; }
  function parallelIndexKey() { return "parallel_index"; }
  function parallelSessionKey(id) { return "parallel_" + id; }

  function loadTimeline(charId) {
    if (state.timelines[charId]) return Promise.resolve(state.timelines[charId]);
    if (!state.roche || !state.roche.storage) { state.timelines[charId] = { entries: [] }; return Promise.resolve(state.timelines[charId]); }
    return state.roche.storage.get(tlKey(charId)).then(function(v) {
      state.timelines[charId] = (v && v.entries) ? v : { entries: [] };
      return state.timelines[charId];
    }).catch(function() { state.timelines[charId] = { entries: [] }; return state.timelines[charId]; });
  }
  function saveTimeline(charId, data) { if (state.roche && state.roche.storage) state.roche.storage.set(tlKey(charId), data); }
  function saveParallelIndex(list) { if (state.roche && state.roche.storage) state.roche.storage.set(parallelIndexKey(), list); }
  function saveParallelSession(session) { if (state.roche && state.roche.storage) state.roche.storage.set(parallelSessionKey(session.id), session); }
  function loadParallelSession(id) {
    if (state.parallelSessions[id]) return Promise.resolve(state.parallelSessions[id]);
    if (!state.roche || !state.roche.storage) return Promise.resolve(null);
    return state.roche.storage.get(parallelSessionKey(id)).then(function(v) { if (v) state.parallelSessions[id] = v; return v; }).catch(function() { return null; });
  }

  /* ─── AI 调用 ─── */
  function aiChat(messages, temperature) {
    if (!state.roche || !state.roche.ai || !state.roche.ai.chat) return Promise.reject(new Error("AI接口不可用"));
    return state.roche.ai.chat({ messages: messages, temperature: temperature }).then(function(r) {
      if (r && typeof r.text === "string") return r.text;
      if (typeof r === "string") return r;
      return "";
    });
  }

  function parseJsonLoose(raw) {
    if (!raw) return null;
    var stripped = String(raw).replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```json/gi, "").replace(/```/g, "");
    var m = stripped.match(/\{[\s\S]*\}/);
    if (!m) m = stripped.match(/\[[\s\S]*\]/);
    if (!m) return null;
    try { return JSON.parse(m[0]); } catch (e) {}
    var partial = m[0];
    var openBraces = 0, openBrackets = 0, inStr = false, escape = false;
    for (var i = 0; i < partial.length; i++) {
      var ch = partial[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { if (inStr) escape = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === "{") openBraces++; else if (ch === "}") openBraces--;
      else if (ch === "[") openBrackets++; else if (ch === "]") openBrackets--;
    }
    if (inStr) partial += '"';
    while (openBrackets > 0) { partial += "]"; openBrackets--; }
    while (openBraces > 0) { partial += "}"; openBraces--; }
    try { return JSON.parse(partial); } catch (e2) { return null; }
  }

  /* ─── 数据辅助 ─── */
  function getCharById(id) {
    for (var i = 0; i < state.characters.length; i++) if (state.characters[i].id === id) return state.characters[i];
    return null;
  }
  function findEntry(charId, entryId) {
    var tl = state.timelines[charId];
    if (!tl || !tl.entries) return null;
    for (var i = 0; i < tl.entries.length; i++) if (tl.entries[i].id === entryId) return tl.entries[i];
    return null;
  }
  function findSlice(session, speakerId) {
    for (var i = 0; i < session.slices.length; i++) if (session.slices[i].speakerId === speakerId) return session.slices[i];
    return null;
  }
  function buildNeighborContext(charId, entryId) {
    var tl = state.timelines[charId];
    if (!tl) return "";
    var entries = tl.entries.slice().sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    var idx = -1;
    for (var i = 0; i < entries.length; i++) if (entries[i].id === entryId) { idx = i; break; }
    if (idx < 0) return "";
    var parts = [];
    if (idx > 0) parts.push("上一段记忆：" + entries[idx - 1].title + (entries[idx - 1].ageLabel ? "（" + entries[idx - 1].ageLabel + "）" : ""));
    if (idx < entries.length - 1) parts.push("下一段记忆：" + entries[idx + 1].title + (entries[idx + 1].ageLabel ? "（" + entries[idx + 1].ageLabel + "）" : ""));
    return parts.join("\n");
  }
  function flattenWorldbookEntries(entries) {
    if (!entries || !entries.length) return "";
    var parts = [];
    for (var i = 0; i < entries.length && parts.length < 30; i++) {
      var e = entries[i];
      var name = e.name || e.title || e.comment || e.key || "";
      var content = e.content || e.text || e.value || "";
      if (content) parts.push((name ? name + "：" : "") + String(content).substring(0, 300));
    }
    return parts.join("\n").substring(0, 3000);
  }
  function loadWorldbookContext(char) {
    if (!state.roche.worldbook || !state.roche.worldbook.getEntries) return Promise.resolve("");
    var q = char.name || char.handle || "";
    if (!q) return Promise.resolve("");
    return state.roche.worldbook.getEntries({ query: q }).then(function(entries) {
      return flattenWorldbookEntries(entries);
    }).catch(function() { return ""; });
  }
  function buildCharacterProfile(char) {
    return loadWorldbookContext(char).then(function(wb) {
      var lines = [];
      lines.push("姓名：" + (char.name || char.handle || "未知"));
      var persona = char.persona || char.bio || "";
      if (persona) lines.push("人设：" + persona);
      if (char.description) lines.push("补充描述：" + char.description);
      if (wb) lines.push("世界设定参考：\n" + wb);
      return lines.join("\n");
    });
  }
  function loadSharedMemory(char) {
    var convId = char.conversationId;
    if (!state.roche.memory || !convId) return Promise.resolve({ core: "", recent: "" });
    var core = "", recent = "";
    var p1 = state.roche.memory.getLongTerm({ conversationId: convId, limit: 100 }).then(function(lt) {
      var coreText = (lt && lt.core && lt.core.summary) ? lt.core.summary : "";
      var factText = (lt && lt.facts || []).map(function(f) { return f.summaryText || f.action || f.text || ""; }).filter(Boolean).join("\n");
      core = [coreText, factText].filter(Boolean).join("\n");
    }).catch(function() {});
    var p2 = state.roche.memory.getShortTerm({ conversationId: convId, limit: 60 }).then(function(msgs) {
      if (msgs && msgs.length) {
        var parts = [];
        var start = Math.max(0, msgs.length - 30);
        for (var i = start; i < msgs.length; i++) {
          var m = msgs[i];
          parts.push((m.senderHandle || m.senderName || "?") + "：" + String(m.text || "").substring(0, 100));
        }
        recent = parts.join("\n");
      }
    }).catch(function() {});
    return Promise.all([p1, p2]).then(function() { return { core: core, recent: recent }; });
  }
  function updateParallelIndexPreview(session) {
    for (var i = 0; i < state.parallelIndex.length; i++) {
      if (state.parallelIndex[i].id === session.id) { state.parallelIndex[i].updatedAt = session.updatedAt; break; }
    }
    saveParallelIndex(state.parallelIndex);
  }

  /* ─── Prompt 构建（均返回 Promise，因为需要先异步取世界书） ─── */
  function buildTimelinePrompt(char) {
    return buildCharacterProfile(char).then(function(profile) {
      var sys = "你是一位擅长挖掘角色人生轨迹的传记作者。你需要基于给定的角色设定，构思该角色人生中从幼年到成年、'遇见用户之前'的一系列重大或有代表性的记忆节点。\n" +
        "要求：\n" +
        "1. 数量 8~12 条，按年龄从小到大排列，贯穿童年、少年、青年直到接近当下的人生阶段。\n" +
        "2. 每条只给出简短标题和关键词，不要写正文内容（正文会在用户点开时单独生成）。\n" +
        "3. 标题要有画面感、克制、口语化，避免'他经历了...'这种说教式概括，参考风格：'奶奶院子里的泥巴仗'、'胡同口挨的那一板砖'。\n" +
        "4. keywords 给 2~4 个短语，是构成这段记忆的关键要素（人物/地点/物件/情绪），供之后生成正文时使用。\n" +
        "5. emotionTag 从以下四选一：温柔记忆、创伤记忆、普通记忆、高光记忆。\n" +
        "6. tone（情绪底色）用一到两个字/词概括，如：明亮、灼热、压抑、温热、锐利、荒芜。\n" +
        "7. 严格贴合角色设定，不要发明与设定冲突的关键属性；设定中未提及的细节可以合理想象补全生活化的日常。\n" +
        "8. 必须只输出合法 JSON，不要输出任何 JSON 之外的文字或解释。\n\n" +
        "输出格式：\n{\"events\":[{\"ageLabel\":\"AGE 06\",\"title\":\"...\",\"keywords\":[\"...\",\"...\"],\"emotionTag\":\"温柔记忆\",\"tone\":\"明亮\"}]}";
      var usr = "【角色设定】\n" + profile + "\n\n请生成这个角色的人生时间线关键节点（遇见用户之前）。";
      return [{ role: "system", content: sys }, { role: "user", content: usr }];
    });
  }
  function buildMeetPrompt(char, shared) {
    return buildCharacterProfile(char).then(function(profile) {
      var userName = state.activePersona ? (state.activePersona.name || state.activePersona.handle || "用户") : "用户";
      var sys = "你是一位擅长挖掘角色人生轨迹的传记作者。这一次，你需要基于角色与用户（" + userName + "）之间真实发生过的相处记忆（长期摘要与近期对话片段），提炼出他们相识以来的几个重要记忆节点。\n" +
        "要求：\n" +
        "1. 数量 3~8 条，按时间先后排列。\n" +
        "2. 每条只给出简短标题和关键词，不要写正文。\n" +
        "3. ageLabel 用相处阶段来表述，例如'初遇'、'熟悉起来'、'一次争执'、'现在'，不要用具体年龄数字。\n" +
        "4. emotionTag 从以下四选一：温柔记忆、创伤记忆、普通记忆、高光记忆。\n" +
        "5. tone 用一到两个字/词概括情绪底色。\n" +
        "6. 只依据提供的相处记忆构思，不要编造未发生过的事；如果相处记忆很少，就诚实地只生成能支撑的条数（哪怕只有1~2条）。\n" +
        "7. 必须只输出合法 JSON，不要输出任何 JSON 之外的文字。\n\n" +
        "输出格式：\n{\"events\":[{\"ageLabel\":\"初遇\",\"title\":\"...\",\"keywords\":[\"...\"],\"emotionTag\":\"温柔记忆\",\"tone\":\"温热\"}]}";
      var usr = "【角色设定】\n" + profile + "\n\n【长期关系摘要】\n" + (shared.core || "（暂无）") + "\n\n【近期对话片段】\n" + (shared.recent || "（暂无）") + "\n\n请提炼出" + (char.name || char.handle) + "与" + userName + "相识以来的记忆节点。";
      return [{ role: "system", content: sys }, { role: "user", content: usr }];
    });
  }
  function buildArticlePrompt(char, entry, context) {
    return buildCharacterProfile(char).then(function(profile) {
      var sys = "你是一位擅长第一人称记忆片段写作的作者。请基于给定的标题与关键词，把这段记忆写成一篇记忆主人第一人称视角的记忆切片。\n" +
        "正文要求：\n" +
        "1. 以记忆主人第一人称写作，1200~1500字，分4~7段，段落之间用换行分隔。按时间顺序推进，呈现清晰的'之前—转折—之后'结构。\n" +
        "2. 内心：写出脑中真实流过的思绪，允许犹豫、否认、自我说服等矛盾念头；情绪需分层递进；转折处必须有一个由具体细节触发的'意识到'瞬间（例如'直到看见……我才意识到……'），这个领悟必须能从前文出现过的细节自然推出，不能凭空出现。\n" +
        "3. 体感：全文至少出现4处具体的身体感受（如心里发慌、胃部下坠、指尖发麻、喉咙发紧、呼吸变浅等），且每一处都必须由具体的所见所闻触发，不能孤立罗列、不能脱离情境堆砌。情绪不要直接点名（不要写'我很难过'、'我很愤怒'），而是通过体感呈现。\n" +
        "4. 白描：多用名词与动词，少用形容词与副词；每段最多使用一个比喻；用'听见了什么/看见了什么/发现了什么'来推进叙事，而不是直接陈述心理结论。\n" +
        "5. 对话克制：只在关键处使用一两句锚点式的话，不要写大段对白。\n" +
        "6. 收尾：落在一个具体的画面、动作或物件上，禁止使用'这段记忆让我明白了……'这类直接点题的句子。\n" +
        "7. 情绪底色只用来决定文字的光线、节奏与用词温度，不要在正文中直接写出'情绪底色'这个词或其值本身。\n" +
        "8. 如果写到不足1200字，请扩写事件发生的过程细节，而不是增加抒情或议论。\n" +
        "9. 严格贴合角色设定与关键词，不要引入无关的新设定。\n" +
        "10. 直接输出正文，不要标题、不要任何解释或前后缀、不要使用 markdown。";
      var usr = "【角色设定】\n" + profile + "\n\n【记忆标题】" + entry.title + "\n【关键词】" + (entry.keywords || []).join("、") +
        "\n【记忆类型】" + (entry.emotionTag || "") + "\n【情绪底色】" + (entry.tone || "") + "\n【所处阶段】" + (entry.ageLabel || "") +
        (context ? "\n\n【前后记忆参考，仅用于保持连贯，不要复述】\n" + context : "") +
        "\n\n请写出这段记忆的正文。";
      return [{ role: "system", content: sys }, { role: "user", content: usr }];
    });
  }
  function speakerLabel(session, speakerId) {
    var s = findSlice(session, speakerId);
    if (s) return session.characterName + "·" + (s.ageLabel || s.title);
    return session.characterName;
  }
  function buildParallelSystemPrompt(session) {
    var char = getCharById(session.characterId) || { name: session.characterName };
    return buildCharacterProfile(char).then(function(baseProfile) {
      var userName = state.activePersona ? (state.activePersona.name || state.activePersona.handle || "用户") : "用户";
      var lines = [];
      lines.push("这是一个'平行时空'的设定：来自" + session.characterName + "人生中不同阶段的" + session.slices.length + "个分身，因某种神秘的时空交汇短暂相遇，可以彼此看见、彼此对话。");
      lines.push("每个分身只知道自己那个阶段及更早之前发生的事，完全不知道之后的人生走向。他们不知道对方就是自己的另一个阶段——只会把对方当作某个看起来眼熟却说不清缘由的人。");
      lines.push("");
      for (var i = 0; i < session.slices.length; i++) {
        var s = session.slices[i];
        lines.push("【分身 " + s.speakerId + "】");
        lines.push("所处阶段：" + s.ageLabel + " —— " + s.title);
        lines.push("这段记忆的内容：" + (s.content || (s.keywords || []).join("、")));
        lines.push("");
      }
      lines.push("角色基础设定：\n" + baseProfile);
      lines.push("");
      if (session.userPresent) {
        lines.push(userName + "也在场，是真实参与对话的第三方，分身们可以感知到" + userName + "并与之互动。");
      } else {
        lines.push(userName + "此刻不在场，是隐形的旁观者，分身们完全无法感知到" + userName + "的存在，对话只在分身之间发生。");
      }
      lines.push("");
      lines.push("对话要求：");
      lines.push("1. 保持每个分身与其所处阶段相符的性格、说话方式与心态，不要让分身表现出这个阶段不该有的成熟视角或信息。");
      lines.push("2. 可以使用旁白/动作描写来表现神态、动作或环境，用 type:\"action\" 承载，不要加星号或括号，直接写描述性文字。");
      lines.push("3. 对话要自然、有来有回，允许沉默、迟疑、误解，不必每次都有结论。");
      lines.push("4. 每次只输出接下来的 1~3 轮，不要一次把所有对话说完。speaker 字段必须是分身的 speakerId（如 self_1），不能是" + userName + "。");
      lines.push("5. 必须只输出合法 JSON，不要输出任何 JSON 之外的文字：");
      lines.push("{\"turns\":[{\"speaker\":\"self_1\",\"type\":\"text或action\",\"text\":\"...\"}]}");
      return lines.join("\n");
    });
  }
  function buildAdvanceUserMessage(session) {
    var parts = [];
    var recent = session.messages.slice(-30);
    if (recent.length === 0) {
      parts.push("（对话尚未开始，请生成一个自然的开场——分身们刚刚意识到彼此的存在。）");
    } else {
      for (var i = 0; i < recent.length; i++) {
        var m = recent[i];
        var name = m.speaker === "user" ? (state.activePersona ? (state.activePersona.name || state.activePersona.handle) : "用户") : speakerLabel(session, m.speaker);
        if (m.type === "action") parts.push("（" + name + " " + m.text + "）");
        else parts.push(name + "：" + m.text);
      }
    }
    return parts.join("\n") + "\n\n请继续生成接下来的对话（1~3轮）。";
  }

  /* ─── 导航 ─── */
  function goTo(view, extra) {
    state.viewStack.push({ view: state.view, currentCharId: state.currentCharId, currentEntryId: state.currentEntryId, currentSessionId: state.currentSessionId });
    state.view = view;
    if (extra) { for (var k in extra) if (extra.hasOwnProperty(k)) state[k] = extra[k]; }
    renderApp();
  }
  function goBack() {
    var prev = state.viewStack.pop();
    state.modalOpen = null;
    if (!prev) { state.view = "charList"; renderApp(); return; }
    state.view = prev.view;
    state.currentCharId = prev.currentCharId;
    state.currentEntryId = prev.currentEntryId;
    state.currentSessionId = prev.currentSessionId;
    renderApp();
  }
  function scrollChatToBottom() {
    setTimeout(function() { var el = document.getElementById("hj-chat-scroll"); if (el) el.scrollTop = el.scrollHeight; }, 50);
  }
  function afterRender() {
    if (state.view === "parallelChat") scrollChatToBottom();
    if (state.modalOpen === "addMemory") setTimeout(function() { var el = document.getElementById("hj-mem-title"); if (el) el.focus(); }, 30);
  }
  function renderApp() {
    if (!state.containerEl) return;
    var html = '<div class="' + ROOT_CLASS + '">';
    if (state.view === "timeline") html += renderTimeline();
    else if (state.view === "detail") html += renderDetail();
    else if (state.view === "parallelList") html += renderParallelList();
    else if (state.view === "parallelSetup") html += renderParallelSetup();
    else if (state.view === "parallelChat") html += renderParallelChat();
    else html += renderCharList();
    if (state.modalOpen === "addMemory") html += renderAddMemoryModal();
    html += "</div>";
    state.containerEl.innerHTML = html;
    afterRender();
  }

  /* ─── 通用组件 ─── */
  function avatarHtml(url, fallbackText, size) {
    size = size || 44;
    if (url) return '<img src="' + escapeHtml(url) + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;display:block">';
    var fb = (fallbackText || "?").trim().substring(0, 1) || "?";
    return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:#f2f2f7;display:flex;align-items:center;justify-content:center;font-size:' + Math.round(size * 0.4) + 'px;color:#6e6e73;font-weight:600;flex-shrink:0">' + escapeHtml(fb) + "</div>";
  }
  function renderHeader(title, subtitle, showBack, backCall, rightHtml) {
    var closeBtn = '<div class="hj-icon-btn" onclick="window.__henji.closeApp()" title="关闭">' + ICONS.close + "</div>";
    return '<div class="hj-header">' +
      '<div class="hj-header-left">' + (showBack ? '<div class="hj-icon-btn" onclick="' + backCall + '">' + ICONS.back + "</div>" : "") + "</div>" +
      '<div class="hj-header-title-wrap"><div class="hj-header-title">' + escapeHtml(title) + "</div>" + (subtitle ? '<div class="hj-header-subtitle">' + escapeHtml(subtitle) + "</div>" : "") + "</div>" +
      '<div class="hj-header-right">' + (rightHtml || "") + closeBtn + "</div>" +
      "</div>";
  }

  /* ─── 视图：角色列表 ─── */
  function renderCharList() {
    var header = renderHeader("痕迹", "", false, "", "");
    var body;
    if (!state.characters.length) {
      body = '<div class="hj-empty">' + ICONS.user + "<p>暂无角色</p></div>";
    } else {
      var items = "";
      for (var i = 0; i < state.characters.length; i++) {
        var c = state.characters[i];
        var title = c.name || c.handle || "未命名";
        var sub = (c.handle && c.handle !== title) ? c.handle : "";
        items += '<div class="hj-list-item" onclick="window.__henji.openCharacter(\'' + c.id + '\')">' +
          '<div class="hj-list-avatar">' + avatarHtml(c.avatar, title) + "</div>" +
          '<div class="hj-list-info"><div class="hj-list-name">' + escapeHtml(title) + "</div>" + (sub ? '<div class="hj-list-sub">' + escapeHtml(sub) + "</div>" : "") + "</div>" +
          '<div class="hj-list-chevron">' + ICONS.chevronRight + "</div>" +
          "</div>";
      }
      body = '<div class="hj-list">' + items + "</div>";
    }
    return header + '<div class="hj-content">' + body + "</div>";
  }

  /* ─── 视图：时间线 ─── */
  function renderTimeline() {
    var char = getCharById(state.currentCharId);
    if (!char) return renderHeader("痕迹", "", true, "window.__henji.goBack()", "") + '<div class="hj-content"><div class="hj-empty"><p>角色不存在</p></div></div>';
    var tl = state.timelines[char.id] || { entries: [] };
    var entries = (tl.entries || []).slice().sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    var displayName = char.name || char.handle || "未命名";

    var rightBtn = '<div class="hj-icon-btn" onclick="window.__henji.showAddMemoryModal()">' + ICONS.plus + "</div>";
    var header = renderHeader(displayName, "Trajectory Archive", true, "window.__henji.goBack()", rightBtn);

    var body = '<div class="hj-timeline-intro">' +
      '<div class="hj-timeline-intro-title">' + escapeHtml(displayName) + '的时间线</div>' +
      '<div class="hj-timeline-intro-sub">Life Trajectory</div>' +
      '<div class="hj-timeline-intro-desc">从独自走过的那些年，到有你以后的每一刻。</div>' +
      "</div>";

    body += '<div class="hj-actions-row">';
    if (!entries.length) {
      body += '<button class="hj-btn hj-btn-primary" style="flex:1" ' + (state.timelineBusy ? "disabled" : "") + ' onclick="window.__henji.generateInitialTimeline()">' + ICONS.sparkle + "<span>生成时间线</span></button>";
    } else {
      body += '<button class="hj-btn hj-btn-outline" style="flex:1" ' + (state.timelineBusy ? "disabled" : "") + ' onclick="window.__henji.confirmRegenerateTimeline()">' + ICONS.refresh + "<span>重新生成</span></button>";
      body += '<button class="hj-btn hj-btn-outline" style="flex:1" ' + (state.timelineBusy ? "disabled" : "") + ' onclick="window.__henji.generateMeetTimeline()">' + ICONS.sparkle + "<span>相遇后的记忆</span></button>";
    }
    body += "</div>";

    if (!entries.length) {
      body += '<div class="hj-timeline"><div class="hj-add-placeholder" onclick="window.__henji.generateInitialTimeline()">' + ICONS.plus + "<p>还没有生成过时间线，点击生成</p></div></div>";
    } else {
      body += '<div class="hj-timeline">';
      for (var i = 0; i < entries.length; i++) body += renderTimelineCard(entries[i]);
      body += '<div class="hj-add-entry-row" onclick="window.__henji.showAddMemoryModal()">' + ICONS.plus + "<span>留下一段记忆</span></div>";
      body += "</div>";
    }

    body += '<div class="hj-portal-card" onclick="window.__henji.openParallelList()">' +
      '<div class="hj-portal-icon">' + ICONS.switchIcon + "</div>" +
      '<div class="hj-portal-text"><div class="hj-portal-title">平行时空</div><div class="hj-portal-sub">让不同阶段的' + escapeHtml(displayName) + '相遇对话</div></div>' +
      '<div class="hj-portal-arrow">' + ICONS.chevronRight + "</div>" +
      "</div>";

    return header + '<div class="hj-content">' + body + "</div>";
  }
  function renderTimelineCard(entry) {
    var colors = getEmotionColor(entry.emotionTag);
    var excerpt = entry.content ? entry.content.replace(/\n+/g, " ").substring(0, 56) : (entry.keywords || []).join(" · ");
    var kws = entry.keywords || [];
    var tagsHtml = "";
    for (var i = 0; i < kws.length; i++) tagsHtml += '<span class="hj-tag-pill">' + escapeHtml(kws[i]) + "</span>";
    var pendingHint = entry.content ? "" : '<div class="hj-card-pending">点击生成正文</div>';
    return '<div class="hj-timeline-item">' +
      '<div class="hj-timeline-rail"><div class="hj-timeline-dot" style="background:' + colors.dot + '"></div></div>' +
      '<div class="hj-timeline-card" onclick="window.__henji.openEntry(\'' + entry.id + '\')">' +
      '<div class="hj-card-toprow"><span class="hj-age-label">' + escapeHtml(entry.ageLabel || "") + '</span><span class="hj-emotion-pill" style="background:' + colors.bg + ";color:" + colors.fg + '">' + escapeHtml(entry.emotionTag || "") + "</span></div>" +
      '<div class="hj-card-title">' + escapeHtml(entry.title || "") + "</div>" +
      (excerpt ? '<div class="hj-card-excerpt">' + escapeHtml(excerpt) + (entry.content ? "…" : "") + "</div>" : "") +
      (tagsHtml ? '<div class="hj-card-tags">' + tagsHtml + "</div>" : "") +
      (entry.tone ? '<div class="hj-card-tone">情绪底色：' + escapeHtml(entry.tone) + "</div>" : "") +
      pendingHint +
      "</div></div>";
  }
  function renderAddMemoryModal() {
    return '<div class="hj-modal-overlay" onclick="if(event.target===this) window.__henji.closeModal()">' +
      '<div class="hj-modal-card">' +
      '<div class="hj-modal-title">留下一段记忆</div>' +
      '<div class="hj-form-group"><div class="hj-form-label">标题</div><input class="hj-input" id="hj-mem-title" placeholder="那段时间的关键记忆" /></div>' +
      '<div class="hj-form-group"><div class="hj-form-label">关键词（逗号分隔）</div><input class="hj-input" id="hj-mem-keywords" placeholder="第一次见面，咖啡馆" /></div>' +
      '<div class="hj-modal-actions">' +
      '<button class="hj-btn hj-btn-outline" style="flex:1" onclick="window.__henji.closeModal()">取消</button>' +
      '<button class="hj-btn hj-btn-primary" style="flex:1" onclick="window.__henji.submitAddMemory()">添加</button>' +
      "</div></div></div>";
  }

  /* ─── 视图：记忆详情 ─── */
  function renderDetail() {
    var char = getCharById(state.currentCharId);
    var entry = char ? findEntry(char.id, state.currentEntryId) : null;
    if (!char || !entry) return renderHeader("痕迹", "", true, "window.__henji.goBack()", "") + '<div class="hj-content"><div class="hj-empty"><p>记忆不存在</p></div></div>';
    var rightBtn = entry.content ? ('<div class="hj-icon-btn" onclick="window.__henji.generateEntryContent(\'' + entry.id + '\')">' + ICONS.refresh + "</div>") : "";
    var header = renderHeader(entry.title || "记忆", entry.ageLabel || "", true, "window.__henji.goBack()", rightBtn);
    var colors = getEmotionColor(entry.emotionTag);
    var body;
    if (!entry.content) {
      if (state.entryBusy) {
        body = '<div class="hj-loading-inline"><div class="hj-spinner"></div><p>正在生成这段记忆…</p></div>';
      } else {
        body = '<div class="hj-empty"><p>这段记忆还没有展开</p><button class="hj-btn hj-btn-primary" onclick="window.__henji.generateEntryContent(\'' + entry.id + '\')">生成正文</button></div>';
      }
    } else {
      var paras = entry.content.split(/\n+/).filter(function(p) { return p.trim().length > 0; });
      var ph = "";
      for (var i = 0; i < paras.length; i++) ph += '<p class="hj-detail-p">' + escapeHtml(paras[i]) + "</p>";
      var kws = entry.keywords || [];
      var tagsHtml = "";
      for (var j = 0; j < kws.length; j++) tagsHtml += '<span class="hj-tag-pill">' + escapeHtml(kws[j]) + "</span>";
      body = '<div class="hj-detail-meta"><span class="hj-emotion-pill" style="background:' + colors.bg + ";color:" + colors.fg + '">' + escapeHtml(entry.emotionTag || "") + "</span>" +
        (entry.tone ? '<span class="hj-card-tone">情绪底色：' + escapeHtml(entry.tone) + "</span>" : "") + "</div>" +
        '<div class="hj-detail-body">' + ph + "</div>" +
        (tagsHtml ? '<div class="hj-card-tags" style="padding:0 20px 24px">' + tagsHtml + "</div>" : "");
    }
    return header + '<div class="hj-content">' + body + "</div>";
  }

  /* ─── 视图：平行时空列表 ─── */
  function renderParallelList() {
    var char = getCharById(state.currentCharId);
    var displayName = char ? (char.name || char.handle) : "";
    var sessions = state.parallelIndex.filter(function(s) { return s.characterId === state.currentCharId; }).sort(function(a, b) { return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0); });
    var rightBtn = '<div class="hj-icon-btn" onclick="window.__henji.openParallelSetup()">' + ICONS.plus + "</div>";
    var header = renderHeader("平行时空", displayName, true, "window.__henji.goBack()", rightBtn);
    var body;
    if (!sessions.length) {
      body = '<div class="hj-empty">' + ICONS.switchIcon + '<p>还没有创建过平行时空</p><button class="hj-btn hj-btn-primary" onclick="window.__henji.openParallelSetup()">创建一个</button></div>';
    } else {
      var items = "";
      for (var i = 0; i < sessions.length; i++) {
        var s = sessions[i];
        items += '<div class="hj-list-item" onclick="window.__henji.openParallelSession(\'' + s.id + '\')">' +
          '<div class="hj-list-avatar">' + avatarHtml(char && char.avatar, displayName) + "</div>" +
          '<div class="hj-list-info"><div class="hj-list-name">' + escapeHtml(s.title || "平行时空") + '</div><div class="hj-list-sub">' + escapeHtml((s.sliceTitles || []).join(" × ")) + "</div></div>" +
          '<div class="hj-list-chevron">' + ICONS.chevronRight + "</div>" +
          "</div>";
      }
      body = '<div class="hj-list">' + items + "</div>";
    }
    return header + '<div class="hj-content">' + body + "</div>";
  }

  /* ─── 视图：平行时空创建 ─── */
  function renderParallelSetup() {
    var char = getCharById(state.currentCharId);
    var displayName = char ? (char.name || char.handle) : "";
    var header = renderHeader("选择记忆切片", displayName, true, "window.__henji.goBack()", "");
    var tl = state.timelines[state.currentCharId] || { entries: [] };
    var candidates = (tl.entries || []).filter(function(e) { return !!e.content; }).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    if (candidates.length < 2) {
      return header + '<div class="hj-content"><div class="hj-empty"><p>至少需要两段已生成正文的记忆才能创建平行时空</p><p class="hj-empty-hint">回到时间线，点开几张卡片阅读生成吧</p></div></div>';
    }
    var body = '<div class="hj-setup-hint">选择 2~3 段记忆，作为不同阶段的' + escapeHtml(displayName) + "</div>";
    body += '<div class="hj-select-list">';
    for (var i = 0; i < candidates.length; i++) {
      var e = candidates[i];
      var selected = state.selectedSliceIds.indexOf(e.id) >= 0;
      body += '<div class="hj-select-card' + (selected ? " selected" : "") + '" onclick="window.__henji.toggleSliceSelect(\'' + e.id + '\')">' +
        '<div class="hj-select-check">' + (selected ? ICONS.check : "") + "</div>" +
        '<div class="hj-select-info"><div class="hj-select-age">' + escapeHtml(e.ageLabel || "") + '</div><div class="hj-select-title">' + escapeHtml(e.title || "") + "</div></div>" +
        "</div>";
    }
    body += "</div>";
    body += '<div class="hj-setup-hint" style="margin-top:22px">用户是否在场</div>';
    body += '<div class="hj-segmented">' +
      '<div class="hj-segmented-btn' + (state.userPresentDraft ? " active" : "") + '" onclick="window.__henji.setUserPresentDraft(true)">在场</div>' +
      '<div class="hj-segmented-btn' + (!state.userPresentDraft ? " active" : "") + '" onclick="window.__henji.setUserPresentDraft(false)">不在场</div>' +
      "</div>";
    var canCreate = state.selectedSliceIds.length >= 2 && state.selectedSliceIds.length <= 3;
    body += '<div style="padding:24px 20px"><button class="hj-btn hj-btn-primary" style="width:100%" ' + (canCreate ? "" : "disabled") + ' onclick="window.__henji.createParallelSession()">创建平行时空（' + state.selectedSliceIds.length + "/3）</button></div>";
    return header + '<div class="hj-content">' + body + "</div>";
  }

  /* ─── 视图：平行时空对话 ─── */
  function renderParallelChat() {
    var session = state.parallelSessions[state.currentSessionId];
    if (!session) return renderHeader("平行时空", "", true, "window.__henji.goBack()", "") + '<div class="hj-content"><div class="hj-empty"><p>会话不存在</p></div></div>';
    var rightBtn = '<div class="hj-icon-btn" onclick="window.__henji.deleteParallelSession(\'' + session.id + '\')">' + ICONS.trash + "</div>";
    var header = renderHeader(session.title, "平行时空 · " + (session.userPresent ? "你在场" : "你旁观"), true, "window.__henji.goBack()", rightBtn);

    var msgsHtml = "";
    for (var i = 0; i < session.messages.length; i++) msgsHtml += renderChatMessage(session, session.messages[i]);
    if (state.parallelBusy) msgsHtml += '<div class="hj-chat-typing"><div class="hj-spinner-sm"></div><span>' + escapeHtml(session.characterName) + "正在回应…</span></div>";
    if (!session.messages.length && !state.parallelBusy) msgsHtml = '<div class="hj-empty"><p>还没有对话，点击下方"推进对话"开始</p></div>';

    var footer = '<div class="hj-chat-footer">';
    if (session.userPresent) {
      footer += '<div class="hj-chat-input-row">' +
        '<div class="hj-chat-toggle' + (state.actionMode ? " active" : "") + '" onclick="window.__henji.toggleActionMode()" title="旁白/动作">' + ICONS.edit + "</div>" +
        '<input class="hj-chat-input" id="hj-chat-input" placeholder="' + (state.actionMode ? "描述一个动作或旁白…" : "输入消息…") + '" onkeydown="if(event.key===\'Enter\') window.__henji.sendParallelMessage()" />' +
        '<div class="hj-chat-send-btn" onclick="window.__henji.sendParallelMessage()">' + ICONS.send + "</div>" +
        "</div>";
    }
    footer += '<button class="hj-btn hj-btn-outline hj-advance-btn" style="width:100%" ' + (state.parallelBusy ? "disabled" : "") + ' onclick="window.__henji.advanceParallel()">' + ICONS.fastForward + "<span>推进对话</span></button>";
    footer += "</div>";

    return header + '<div class="hj-content hj-chat-scroll" id="hj-chat-scroll">' + msgsHtml + "</div>" + footer;
  }
  function renderChatMessage(session, msg) {
    if (msg.type === "action") return '<div class="hj-msg-action">' + escapeHtml(msg.text) + "</div>";
    var isUser = msg.speaker === "user";
    var name = isUser ? (state.activePersona ? (state.activePersona.name || state.activePersona.handle || "你") : "你") : speakerLabel(session, msg.speaker);
    var avatarUrl = isUser ? (state.activePersona && state.activePersona.avatar) : session.characterAvatar;
    return '<div class="hj-msg-row' + (isUser ? " me" : "") + '">' +
      (!isUser ? '<div class="hj-msg-avatar">' + avatarHtml(avatarUrl, name, 34) + "</div>" : "") +
      '<div class="hj-msg-col">' +
      (!isUser ? '<div class="hj-msg-name">' + escapeHtml(name) + "</div>" : "") +
      '<div class="hj-msg-bubble' + (isUser ? " me" : "") + '">' + escapeHtml(msg.text) + "</div>" +
      '<div class="hj-msg-time">' + formatTime(msg.ts) + "</div>" +
      "</div>" +
      (isUser ? '<div class="hj-msg-avatar">' + avatarHtml(avatarUrl, name, 34) + "</div>" : "") +
      "</div>";
  }

  /* ─── 事件处理 ─── */
  function closeApp() { if (state.roche && state.roche.ui && state.roche.ui.closeApp) state.roche.ui.closeApp(); }
  function openCharacter(charId) {
    state.currentCharId = charId;
    loadTimeline(charId).then(function() { goTo("timeline"); });
  }
  function showAddMemoryModal() { state.modalOpen = "addMemory"; renderApp(); }
  function closeModal() { state.modalOpen = null; renderApp(); }
  function submitAddMemory() {
    var char = getCharById(state.currentCharId);
    if (!char) return;
    var titleEl = document.getElementById("hj-mem-title");
    var kwEl = document.getElementById("hj-mem-keywords");
    var title = titleEl ? titleEl.value.trim() : "";
    if (!title) { toast("请填写标题"); return; }
    var keywords = kwEl ? kwEl.value.split(/[,，]/).map(function(s) { return s.trim(); }).filter(Boolean) : [];
    var tl = state.timelines[char.id] || { entries: [] };
    var maxOrder = (tl.entries || []).reduce(function(m, e) { return Math.max(m, e.order || 0); }, -1);
    var entry = { id: generateId(), ageLabel: "自定义", title: title, keywords: keywords, emotionTag: "普通记忆", tone: "", content: null, source: "user", order: maxOrder + 1 };
    tl.entries = (tl.entries || []).concat([entry]);
    state.timelines[char.id] = tl;
    saveTimeline(char.id, tl);
    state.modalOpen = null;
    renderApp();
  }
  function confirmRegenerateTimeline() {
    var char = getCharById(state.currentCharId);
    if (!char) return;
    var tl = state.timelines[char.id];
    var hasGeneratedContent = !!(tl && tl.entries && tl.entries.some(function(e) { return e.source === "auto" && e.content; }));
    if (!hasGeneratedContent) { generateInitialTimeline(); return; }
    if (state.roche && state.roche.ui && state.roche.ui.confirm) {
      state.roche.ui.confirm({ title: "重新生成时间线", message: "这会替换掉现在的时间线节点，其中已经写好正文的记忆卡片也会一并丢失，确定要重新生成吗？" }).then(function(ok) { if (ok) generateInitialTimeline(); }).catch(function() {});
    } else {
      generateInitialTimeline();
    }
  }
  function generateInitialTimeline() {
    var char = getCharById(state.currentCharId);
    if (!char || state.timelineBusy) return;
    state.timelineBusy = true; renderApp();
    buildTimelinePrompt(char).then(function(messages) { return aiChat(messages, 0.9); }).then(function(raw) {
      var data = parseJsonLoose(raw);
      var events = data && data.events;
      state.timelineBusy = false;
      if (!events || !events.length) { toast("生成失败，请重试"); renderApp(); return; }
      var entries = [];
      for (var i = 0; i < events.length; i++) {
        var e = events[i];
        entries.push({ id: generateId(), ageLabel: e.ageLabel || "", title: e.title || "未命名记忆", keywords: (Object.prototype.toString.call(e.keywords) === "[object Array]") ? e.keywords : [], emotionTag: e.emotionTag || "普通记忆", tone: e.tone || "", content: null, source: "auto", order: i });
      }
      var tl = state.timelines[char.id] || { entries: [] };
      var kept = (tl.entries || []).filter(function(en) { return en.source !== "auto"; });
      for (var k = 0; k < kept.length; k++) kept[k].order = entries.length + k;
      tl.entries = entries.concat(kept);
      state.timelines[char.id] = tl;
      saveTimeline(char.id, tl);
      toast("时间线已生成");
      renderApp();
    }).catch(function(e) { state.timelineBusy = false; toast("生成失败：" + (e && e.message ? e.message : "未知错误")); renderApp(); });
  }
  function generateMeetTimeline() {
    var char = getCharById(state.currentCharId);
    if (!char || state.timelineBusy) return;
    state.timelineBusy = true; renderApp();
    loadSharedMemory(char).then(function(shared) {
      if (!shared.core && !shared.recent) { state.timelineBusy = false; toast("暂无与该角色的相处记录"); renderApp(); return null; }
      return buildMeetPrompt(char, shared).then(function(messages) { return aiChat(messages, 0.9); }).then(function(raw) {
        var data = parseJsonLoose(raw);
        var events = data && data.events;
        state.timelineBusy = false;
        if (!events || !events.length) { toast("生成失败，请重试"); renderApp(); return; }
        var tl = state.timelines[char.id] || { entries: [] };
        var baseOrder = (tl.entries || []).reduce(function(m, en) { return Math.max(m, en.order || 0); }, -1) + 1;
        var newEntries = [];
        for (var i = 0; i < events.length; i++) {
          var e = events[i];
          newEntries.push({ id: generateId(), ageLabel: e.ageLabel || "相遇", title: e.title || "未命名记忆", keywords: (Object.prototype.toString.call(e.keywords) === "[object Array]") ? e.keywords : [], emotionTag: e.emotionTag || "普通记忆", tone: e.tone || "", content: null, source: "meet", order: baseOrder + i });
        }
        tl.entries = (tl.entries || []).filter(function(en) { return en.source !== "meet"; }).concat(newEntries);
        state.timelines[char.id] = tl;
        saveTimeline(char.id, tl);
        toast("相遇后的记忆已生成");
        renderApp();
      });
    }).catch(function(e) { state.timelineBusy = false; toast("生成失败：" + (e && e.message ? e.message : "未知错误")); renderApp(); });
  }
  function openEntry(id) {
    goTo("detail", { currentEntryId: id });
    var entry = findEntry(state.currentCharId, id);
    if (entry && !entry.content) generateEntryContent(id);
  }
  function generateEntryContent(id) {
    var char = getCharById(state.currentCharId);
    var entry = char ? findEntry(char.id, id) : null;
    if (!char || !entry || state.entryBusy) return;
    state.entryBusy = true; renderApp();
    var context = buildNeighborContext(char.id, id);
    buildArticlePrompt(char, entry, context).then(function(messages) { return aiChat(messages, 1.0); }).then(function(raw) {
      var text = (raw || "").trim().replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");
      entry.content = text || "（生成失败，请重试）";
      entry.contentGeneratedAt = Date.now();
      saveTimeline(char.id, state.timelines[char.id]);
      state.entryBusy = false;
      renderApp();
    }).catch(function(e) { state.entryBusy = false; toast("生成失败：" + (e && e.message ? e.message : "未知错误")); renderApp(); });
  }
  function openParallelList() {
    if (state.parallelIndex && state.parallelIndex.length !== undefined) { goTo("parallelList"); return; }
    goTo("parallelList");
  }
  function openParallelSetup() {
    state.selectedSliceIds = [];
    state.userPresentDraft = true;
    goTo("parallelSetup");
  }
  function toggleSliceSelect(id) {
    var idx = state.selectedSliceIds.indexOf(id);
    if (idx >= 0) { state.selectedSliceIds.splice(idx, 1); }
    else {
      if (state.selectedSliceIds.length >= 3) { toast("最多选择3段记忆"); return; }
      state.selectedSliceIds.push(id);
    }
    renderApp();
  }
  function setUserPresentDraft(v) { state.userPresentDraft = !!v; renderApp(); }
  function createParallelSession() {
    var char = getCharById(state.currentCharId);
    if (!char || state.selectedSliceIds.length < 2) return;
    var slices = [];
    for (var i = 0; i < state.selectedSliceIds.length; i++) {
      var e = findEntry(char.id, state.selectedSliceIds[i]);
      if (e) slices.push({ entryId: e.id, speakerId: "self_" + (i + 1), ageLabel: e.ageLabel, title: e.title, keywords: e.keywords || [], content: e.content || "" });
    }
    if (slices.length < 2) { toast("请至少选择两段记忆"); return; }
    var session = {
      id: generateId(), characterId: char.id, characterName: char.name || char.handle, characterAvatar: char.avatar || "",
      title: slices.map(function(s) { return s.ageLabel || s.title; }).join(" × "),
      slices: slices, userPresent: state.userPresentDraft, messages: [], createdAt: Date.now(), updatedAt: Date.now()
    };
    state.parallelSessions[session.id] = session;
    state.parallelIndex.push({ id: session.id, characterId: char.id, title: session.title, sliceTitles: slices.map(function(s) { return s.title; }), userPresent: session.userPresent, createdAt: session.createdAt, updatedAt: session.updatedAt });
    saveParallelIndex(state.parallelIndex);
    saveParallelSession(session);
    state.selectedSliceIds = [];
    goTo("parallelChat", { currentSessionId: session.id });
    advanceParallel();
  }
  function openParallelSession(id) {
    if (state.parallelSessions[id]) { goTo("parallelChat", { currentSessionId: id }); return; }
    loadParallelSession(id).then(function(s) {
      if (s) goTo("parallelChat", { currentSessionId: id });
      else toast("会话不存在");
    });
  }
  function deleteParallelSession(id) {
    function doDelete() {
      delete state.parallelSessions[id];
      state.parallelIndex = state.parallelIndex.filter(function(s) { return s.id !== id; });
      saveParallelIndex(state.parallelIndex);
      if (state.roche && state.roche.storage && state.roche.storage.delete) { try { state.roche.storage.delete(parallelSessionKey(id)); } catch (e) {} }
      goBack();
    }
    if (state.roche && state.roche.ui && state.roche.ui.confirm) {
      state.roche.ui.confirm({ title: "删除平行时空", message: "确定要删除这段对话吗？此操作无法撤销。" }).then(function(ok) { if (ok) doDelete(); }).catch(function() {});
    } else {
      doDelete();
    }
  }
  function toggleActionMode() { state.actionMode = !state.actionMode; renderApp(); }
  function sendParallelMessage() {
    var session = state.parallelSessions[state.currentSessionId];
    var input = document.getElementById("hj-chat-input");
    if (!session || !input) return;
    var text = input.value.trim();
    if (!text) return;
    session.messages.push({ id: generateId(), speaker: "user", type: state.actionMode ? "action" : "text", text: text, ts: Date.now() });
    input.value = "";
    state.actionMode = false;
    session.updatedAt = Date.now();
    saveParallelSession(session);
    updateParallelIndexPreview(session);
    renderApp();
    advanceParallel();
  }
  function advanceParallel() {
    var session = state.parallelSessions[state.currentSessionId];
    if (!session || state.parallelBusy) return;
    state.parallelBusy = true; renderApp();
    var usr = buildAdvanceUserMessage(session);
    buildParallelSystemPrompt(session).then(function(sys) {
      return aiChat([{ role: "system", content: sys }, { role: "user", content: usr }], 1.0);
    }).then(function(raw) {
      var data = parseJsonLoose(raw);
      var turns = data && data.turns;
      state.parallelBusy = false;
      if (!turns || !turns.length) { toast("生成失败，请重试"); renderApp(); return; }
      for (var i = 0; i < turns.length; i++) {
        var t = turns[i];
        var speaker = t.speaker;
        if (speaker !== "user" && !findSlice(session, speaker)) speaker = session.slices[0].speakerId;
        session.messages.push({ id: generateId(), speaker: speaker, type: t.type === "action" ? "action" : "text", text: t.text || "", ts: Date.now() });
      }
      session.updatedAt = Date.now();
      saveParallelSession(session);
      updateParallelIndexPreview(session);
      renderApp();
    }).catch(function(e) { state.parallelBusy = false; toast("生成失败：" + (e && e.message ? e.message : "未知错误")); renderApp(); });
  }

  /* ─── 样式 ─── */
  function getStyles() {
    return [
      "." + ROOT_CLASS + " *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}",
      "." + ROOT_CLASS + "{display:flex;flex-direction:column;height:100%;background:#ffffff;color:#1c1c1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
      "." + ROOT_CLASS + " .hj-header{display:flex;align-items:center;padding:10px 12px;padding-top:calc(10px + var(--safe-top,0px));border-bottom:1px solid #ececee;position:sticky;top:0;z-index:100;min-height:52px;flex-shrink:0;background:#ffffff}",
      "." + ROOT_CLASS + " .hj-header-left{width:40px;display:flex;align-items:center;flex-shrink:0}",
      "." + ROOT_CLASS + " .hj-header-right{min-width:40px;display:flex;align-items:center;flex-shrink:0;gap:2px;justify-content:flex-end}",
      "." + ROOT_CLASS + " .hj-header-title-wrap{flex:1;text-align:center;overflow:hidden}",
      "." + ROOT_CLASS + " .hj-header-title{font-size:18px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "." + ROOT_CLASS + " .hj-header-subtitle{font-size:11px;letter-spacing:.08em;color:#9a9a9e;font-style:italic;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "." + ROOT_CLASS + " .hj-icon-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer;color:#1c1c1e;transition:background .2s,transform .1s}",
      "." + ROOT_CLASS + " .hj-icon-btn:active{transform:scale(.9);background:#f2f2f7}",
      "." + ROOT_CLASS + " .hj-content{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:calc(24px + var(--safe-bottom,0px))}",
      "." + ROOT_CLASS + " .hj-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:70px 24px;color:#9a9a9e;text-align:center;gap:10px}",
      "." + ROOT_CLASS + " .hj-empty svg{width:40px;height:40px;opacity:.35}",
      "." + ROOT_CLASS + " .hj-empty p{font-size:14px}",
      "." + ROOT_CLASS + " .hj-empty-hint{font-size:12px;opacity:.7}",
      "." + ROOT_CLASS + " .hj-list-item{display:flex;align-items:center;gap:12px;padding:14px 18px;cursor:pointer;border-bottom:1px solid #ececee;transition:background .15s}",
      "." + ROOT_CLASS + " .hj-list-item:active{background:#f7f7f8}",
      "." + ROOT_CLASS + " .hj-list-info{flex:1;min-width:0}",
      "." + ROOT_CLASS + " .hj-list-name{font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "." + ROOT_CLASS + " .hj-list-sub{font-size:13px;color:#6e6e73;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "." + ROOT_CLASS + " .hj-list-chevron{color:#c2c2c6;flex-shrink:0}",
      "." + ROOT_CLASS + " .hj-timeline-intro{padding:22px 20px 6px}",
      "." + ROOT_CLASS + " .hj-timeline-intro-title{font-size:20px;font-weight:700}",
      "." + ROOT_CLASS + " .hj-timeline-intro-sub{font-size:11px;letter-spacing:.1em;color:#9a9a9e;font-style:italic;margin-top:2px;text-transform:uppercase}",
      "." + ROOT_CLASS + " .hj-timeline-intro-desc{font-size:13px;color:#6e6e73;margin-top:10px;line-height:1.6}",
      "." + ROOT_CLASS + " .hj-actions-row{display:flex;gap:10px;padding:16px 20px 4px}",
      "." + ROOT_CLASS + " .hj-btn{display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 16px;border-radius:14px;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:transform .1s,opacity .2s}",
      "." + ROOT_CLASS + " .hj-btn:active{transform:scale(.97)}",
      "." + ROOT_CLASS + " .hj-btn[disabled]{opacity:.4;pointer-events:none}",
      "." + ROOT_CLASS + " .hj-btn svg{width:16px;height:16px;flex-shrink:0}",
      "." + ROOT_CLASS + " .hj-btn-primary{background:#1c1c1e;color:#ffffff}",
      "." + ROOT_CLASS + " .hj-btn-outline{background:transparent;border:1.5px solid #d8d8dc;color:#1c1c1e}",
      "." + ROOT_CLASS + " .hj-timeline{padding:20px 20px 8px}",
      "." + ROOT_CLASS + " .hj-timeline-item{display:flex;gap:12px}",
      "." + ROOT_CLASS + " .hj-timeline-rail{width:10px;display:flex;flex-direction:column;align-items:center;flex-shrink:0}",
      "." + ROOT_CLASS + " .hj-timeline-rail::before{content:'';flex:1;width:1.5px;background:#e5e5ea}",
      "." + ROOT_CLASS + " .hj-timeline-item:first-child .hj-timeline-rail::before{margin-top:6px}",
      "." + ROOT_CLASS + " .hj-timeline-dot{width:10px;height:10px;border-radius:50%;margin-top:18px;flex-shrink:0}",
      "." + ROOT_CLASS + " .hj-timeline-card{flex:1;background:#ffffff;border:1px solid #ececee;box-shadow:0 1px 3px rgba(0,0,0,.04);border-radius:18px;padding:16px;margin-bottom:16px;cursor:pointer;transition:transform .15s}",
      "." + ROOT_CLASS + " .hj-timeline-card:active{transform:scale(.98)}",
      "." + ROOT_CLASS + " .hj-card-toprow{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}",
      "." + ROOT_CLASS + " .hj-age-label{font-size:11px;font-style:italic;letter-spacing:.06em;color:#9a9a9e;text-transform:uppercase}",
      "." + ROOT_CLASS + " .hj-emotion-pill{font-size:11px;padding:3px 9px;border-radius:10px;white-space:nowrap}",
      "." + ROOT_CLASS + " .hj-card-title{font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.4}",
      "." + ROOT_CLASS + " .hj-card-excerpt{font-size:13px;font-style:italic;color:#6e6e73;line-height:1.6;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
      "." + ROOT_CLASS + " .hj-card-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}",
      "." + ROOT_CLASS + " .hj-tag-pill{font-size:11px;padding:3px 9px;border-radius:10px;background:#f2f2f7;color:#6e6e73}",
      "." + ROOT_CLASS + " .hj-card-tone{font-size:12px;color:#9a9a9e}",
      "." + ROOT_CLASS + " .hj-card-pending{font-size:11px;color:#9a9a9e;margin-top:8px;text-align:right}",
      "." + ROOT_CLASS + " .hj-add-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 20px;border:1.5px dashed #d8d8dc;border-radius:18px;color:#9a9a9e;cursor:pointer}",
      "." + ROOT_CLASS + " .hj-add-entry-row{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border:1.5px dashed #d8d8dc;border-radius:18px;color:#6e6e73;cursor:pointer;font-size:13px;margin-left:22px}",
      "." + ROOT_CLASS + " .hj-portal-card{display:flex;align-items:center;gap:14px;margin:24px 20px;padding:18px;border-radius:22px;background:#ffffff;border:1px solid #ececee;box-shadow:0 1px 3px rgba(0,0,0,.04);cursor:pointer}",
      "." + ROOT_CLASS + " .hj-portal-card:active{transform:scale(.98)}",
      "." + ROOT_CLASS + " .hj-portal-icon{width:44px;height:44px;border-radius:50%;background:#f2f2f7;display:flex;align-items:center;justify-content:center;flex-shrink:0}",
      "." + ROOT_CLASS + " .hj-portal-text{flex:1;min-width:0}",
      "." + ROOT_CLASS + " .hj-portal-title{font-size:16px;font-weight:700}",
      "." + ROOT_CLASS + " .hj-portal-sub{font-size:12px;color:#6e6e73;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "." + ROOT_CLASS + " .hj-portal-arrow{color:#c2c2c6;flex-shrink:0}",
      "." + ROOT_CLASS + " .hj-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.4);z-index:400;display:flex;align-items:center;justify-content:center;padding:24px;animation:hjFadeIn .18s}",
      "." + ROOT_CLASS + " .hj-modal-card{width:100%;max-width:340px;background:#ffffff;border-radius:22px;padding:22px;box-shadow:0 8px 32px rgba(0,0,0,.16);animation:hjPopIn .2s}",
      "." + ROOT_CLASS + " .hj-modal-title{font-size:16px;font-weight:700;text-align:center;margin-bottom:18px}",
      "." + ROOT_CLASS + " .hj-form-group{margin-bottom:14px}",
      "." + ROOT_CLASS + " .hj-form-label{font-size:12px;color:#6e6e73;margin-bottom:6px}",
      "." + ROOT_CLASS + " .hj-input{width:100%;padding:11px 14px;border-radius:14px;border:1px solid #d8d8dc;background:#ffffff;color:#1c1c1e;font-size:14px;outline:none}",
      "." + ROOT_CLASS + " .hj-input:focus{border-color:#1c1c1e}",
      "." + ROOT_CLASS + " .hj-modal-actions{display:flex;gap:10px;margin-top:6px}",
      "." + ROOT_CLASS + " .hj-loading-inline{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:60px 20px;color:#6e6e73;font-size:13px}",
      "." + ROOT_CLASS + " .hj-spinner{width:26px;height:26px;border-radius:50%;border:2.5px solid #e5e5ea;border-top-color:#1c1c1e;animation:hjSpin .8s linear infinite}",
      "." + ROOT_CLASS + " .hj-spinner-sm{width:14px;height:14px;border-radius:50%;border:2px solid #e5e5ea;border-top-color:#6e6e73;animation:hjSpin .8s linear infinite;flex-shrink:0}",
      "." + ROOT_CLASS + " .hj-detail-meta{display:flex;align-items:center;gap:10px;padding:18px 20px 6px}",
      "." + ROOT_CLASS + " .hj-detail-body{padding:16px 20px 8px}",
      "." + ROOT_CLASS + " .hj-detail-p{font-size:15px;line-height:1.9;color:#1c1c1e;margin-bottom:16px}",
      "." + ROOT_CLASS + " .hj-setup-hint{font-size:13px;color:#6e6e73;padding:18px 20px 10px}",
      "." + ROOT_CLASS + " .hj-select-list{padding:0 20px;display:flex;flex-direction:column;gap:10px}",
      "." + ROOT_CLASS + " .hj-select-card{display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;border:1.5px solid #ececee;cursor:pointer;transition:border-color .15s,background .15s}",
      "." + ROOT_CLASS + " .hj-select-card.selected{border-color:#1c1c1e;background:#f7f7f8}",
      "." + ROOT_CLASS + " .hj-select-check{width:20px;height:20px;border-radius:50%;border:1.5px solid #d8d8dc;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#ffffff}",
      "." + ROOT_CLASS + " .hj-select-card.selected .hj-select-check{background:#1c1c1e;border-color:#1c1c1e}",
      "." + ROOT_CLASS + " .hj-select-age{font-size:11px;color:#9a9a9e;font-style:italic;text-transform:uppercase}",
      "." + ROOT_CLASS + " .hj-select-title{font-size:14px;font-weight:600;margin-top:2px}",
      "." + ROOT_CLASS + " .hj-segmented{display:flex;margin:0 20px;border-radius:14px;overflow:hidden;border:1px solid #d8d8dc}",
      "." + ROOT_CLASS + " .hj-segmented-btn{flex:1;text-align:center;padding:11px;font-size:13px;cursor:pointer;color:#6e6e73}",
      "." + ROOT_CLASS + " .hj-segmented-btn.active{background:#1c1c1e;color:#ffffff;font-weight:600}",
      "." + ROOT_CLASS + " .hj-chat-scroll{padding:14px 14px 4px;display:flex;flex-direction:column}",
      "." + ROOT_CLASS + " .hj-msg-row{display:flex;align-items:flex-end;gap:8px;margin-bottom:14px;max-width:100%}",
      "." + ROOT_CLASS + " .hj-msg-row.me{flex-direction:row-reverse}",
      "." + ROOT_CLASS + " .hj-msg-avatar{flex-shrink:0}",
      "." + ROOT_CLASS + " .hj-msg-col{display:flex;flex-direction:column;max-width:72%}",
      "." + ROOT_CLASS + " .hj-msg-row.me .hj-msg-col{align-items:flex-end}",
      "." + ROOT_CLASS + " .hj-msg-name{font-size:11px;color:#9a9a9e;margin-bottom:4px;margin-left:2px}",
      "." + ROOT_CLASS + " .hj-msg-bubble{background:#f2f2f7;border:1px solid #ececee;color:#1c1c1e;padding:10px 14px;border-radius:16px 16px 16px 4px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-break:break-word}",
      "." + ROOT_CLASS + " .hj-msg-bubble.me{background:#1c1c1e;color:#ffffff;border-radius:16px 16px 4px 16px;border:none}",
      "." + ROOT_CLASS + " .hj-msg-time{font-size:10px;color:#9a9a9e;margin-top:4px;margin-left:2px}",
      "." + ROOT_CLASS + " .hj-msg-row.me .hj-msg-time{margin-left:0;margin-right:2px}",
      "." + ROOT_CLASS + " .hj-msg-action{text-align:center;font-size:12.5px;font-style:italic;color:#9a9a9e;margin:14px 30px}",
      "." + ROOT_CLASS + " .hj-chat-typing{display:flex;align-items:center;gap:8px;padding:6px 4px;color:#9a9a9e;font-size:12px}",
      "." + ROOT_CLASS + " .hj-chat-footer{border-top:1px solid #ececee;padding:10px 14px;padding-bottom:calc(10px + var(--safe-bottom,0px));display:flex;flex-direction:column;gap:8px;background:#ffffff}",
      "." + ROOT_CLASS + " .hj-chat-input-row{display:flex;align-items:center;gap:8px}",
      "." + ROOT_CLASS + " .hj-chat-toggle{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#6e6e73;flex-shrink:0;cursor:pointer}",
      "." + ROOT_CLASS + " .hj-chat-toggle.active{background:#1c1c1e;color:#ffffff}",
      "." + ROOT_CLASS + " .hj-chat-input{flex:1;padding:10px 14px;border-radius:20px;border:1px solid #d8d8dc;background:#f7f7f8;color:#1c1c1e;font-size:14px;outline:none;min-width:0}",
      "." + ROOT_CLASS + " .hj-chat-send-btn{width:34px;height:34px;border-radius:50%;background:#1c1c1e;color:#ffffff;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer}",
      "." + ROOT_CLASS + " .hj-advance-btn{opacity:.9}",
      "@keyframes hjSpin{to{transform:rotate(360deg)}}",
      "@keyframes hjFadeIn{from{opacity:0}to{opacity:1}}",
      "@keyframes hjPopIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}"
    ].join("\n");
  }

  /* ─── 插件对外 API ─── */
  var _henjiAPI = null;
  function createHenjiAPI() {
    return {
      closeApp: closeApp,
      openCharacter: openCharacter,
      goBack: goBack,
      showAddMemoryModal: showAddMemoryModal,
      closeModal: closeModal,
      submitAddMemory: submitAddMemory,
      generateInitialTimeline: generateInitialTimeline,
      confirmRegenerateTimeline: confirmRegenerateTimeline,
      generateMeetTimeline: generateMeetTimeline,
      openEntry: openEntry,
      generateEntryContent: generateEntryContent,
      openParallelList: openParallelList,
      openParallelSetup: openParallelSetup,
      toggleSliceSelect: toggleSliceSelect,
      setUserPresentDraft: setUserPresentDraft,
      createParallelSession: createParallelSession,
      openParallelSession: openParallelSession,
      deleteParallelSession: deleteParallelSession,
      toggleActionMode: toggleActionMode,
      sendParallelMessage: sendParallelMessage,
      advanceParallel: advanceParallel
    };
  }
  Object.defineProperty(window, "__henji", {
    get: function() { if (!_henjiAPI) _henjiAPI = createHenjiAPI(); return _henjiAPI; },
    set: function(val) { _henjiAPI = val; },
    configurable: true,
    enumerable: true
  });

  /* ─── 插件注册 ─── */
  window.RochePlugin.register({
    id: PLUGIN_ID,
    name: "痕迹",
    version: "1.0.0",
    apps: [
      {
        id: APP_ID,
        name: "痕迹",
        icon: "extension",
        iconImage: "",
        mount: function(container, roche) {
          debugLog("mount called");
          state.roche = roche;
          state.containerEl = container;
          state.view = "charList";
          state.viewStack = [];

          _henjiAPI = createHenjiAPI();
          try {
            Object.defineProperty(window, "__henji", {
              get: function() { if (!_henjiAPI) _henjiAPI = createHenjiAPI(); return _henjiAPI; },
              set: function(val) { _henjiAPI = val; },
              configurable: true,
              enumerable: true
            });
          } catch (e) { window.__henji = _henjiAPI; }

          var oldStyle = document.querySelector('style[data-henji-style="1"]');
          if (oldStyle && oldStyle.parentNode) oldStyle.parentNode.removeChild(oldStyle);
          var styleEl = document.createElement("style");
          styleEl.textContent = getStyles();
          styleEl.setAttribute("data-henji-style", "1");
          document.head.appendChild(styleEl);
          state.styleEl = styleEl;

          container.innerHTML = '<div class="' + ROOT_CLASS + '"><div class="hj-loading-inline"><div class="hj-spinner"></div></div></div>';

          var promises = [];
          if (roche.character && roche.character.list) promises.push(roche.character.list().then(function(l) { state.characters = l || []; }).catch(function() { state.characters = []; }));
          if (roche.persona && roche.persona.getActiveUserPersona) promises.push(roche.persona.getActiveUserPersona().then(function(p) { state.activePersona = p || null; }).catch(function() {}));
          if (roche.storage && roche.storage.get) promises.push(roche.storage.get(parallelIndexKey()).then(function(v) { state.parallelIndex = v || []; }).catch(function() {}));

          Promise.all(promises).then(function() { renderApp(); }).catch(function() { renderApp(); });
        },
        unmount: function(container) {
          debugLog("unmount called");
          if (state.styleEl && state.styleEl.parentNode) state.styleEl.parentNode.removeChild(state.styleEl);
          if (container && container.replaceChildren) container.replaceChildren();
          else if (container) container.innerHTML = "";
          state.containerEl = null;
        }
      }
    ]
  });
})();
