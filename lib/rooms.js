/* Multiplayer room helpers */

const MAX_CHAT = 50;

function createRoom(code, teacherId, roomTitle, teacherToken) {
  const title = (roomTitle || "חדר כיתה").trim().slice(0, 48);
  return {
    code,
    teacherId,
    teacherName: title,
    roomTitle: title,
    teacherToken: teacherToken || null,
    teacherGraceTimer: null,
    students: new Map(),
    activeGame: null,
    gameState: {},
    scores: { teacher: 0 },
    chat: [],
  };
}

function roomSummary(room) {
  const students = Array.from(room.students.entries()).map(([id, s]) => ({
    id,
    name: s.name,
    score: s.score || 0,
    suspended: !!s.suspended,
  }));
  return {
    code: room.code,
    teacherConnected: !!room.teacherId,
    teacherName: room.teacherName || "",
    roomTitle: room.roomTitle || room.teacherName || "",
    students,
    studentCount: students.length,
    studentConnected: students.length > 0,
    studentName: students.length === 1 ? students[0].name : students.length > 1 ? `${students.length} תלמידים` : "",
    activeGame: room.activeGame,
    scores: {
      teacher: room.scores.teacher,
      student: students.reduce((sum, s) => sum + s.score, 0),
      students: Object.fromEntries(students.map((s) => [s.id, s.score])),
    },
    chat: (room.chat || []).slice(-MAX_CHAT),
  };
}

function getRole(room, socketId) {
  if (room.teacherId === socketId) return "teacher";
  if (room.students.has(socketId)) return "student";
  return null;
}

function playerKey(room, socketId, role) {
  return role === "teacher" ? "teacher" : socketId;
}

function addScore(room, socketId, role, points) {
  if (role === "teacher") {
    room.scores.teacher += points;
    return;
  }
  const s = room.students.get(socketId);
  if (s && !s.suspended) s.score = (s.score || 0) + points;
}

function hasStudents(room) {
  return room.students.size > 0;
}

function isSuspended(room, socketId) {
  return !!room.students.get(socketId)?.suspended;
}

function addChatMessage(room, { fromId, fromName, role, emoji }) {
  if (!room.chat) room.chat = [];
  const msg = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fromId,
    fromName,
    role,
    emoji,
    at: Date.now(),
  };
  room.chat.push(msg);
  if (room.chat.length > MAX_CHAT) room.chat.splice(0, room.chat.length - MAX_CHAT);
  return msg;
}

module.exports = {
  createRoom,
  roomSummary,
  getRole,
  playerKey,
  addScore,
  hasStudents,
  isSuspended,
  addChatMessage,
  MAX_CHAT,
};
