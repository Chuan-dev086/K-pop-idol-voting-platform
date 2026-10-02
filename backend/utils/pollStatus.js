const getPollStatus = (poll) => {
  const now = new Date();
  const start = new Date(poll.startDate);
  const end = new Date(poll.endDate);

  // 提取"本地日期"（忽略时分秒）
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (today < startDay) return "upcoming";
  if (today > endDay) return "ended";
  return "active";
};

module.exports = getPollStatus;
