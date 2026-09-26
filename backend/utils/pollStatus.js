const getPollStatus = (poll) => {
  const now = new Date();

  if (now < poll.startDate) return "upcoming";
  if (now > poll.endDate) return "ended";
  return "active";
};

module.exports = getPollStatus;
