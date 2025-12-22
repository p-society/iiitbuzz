/**
 *  made this to  generates a consistent Tailwind background color class based on a string ID.
 * to ensures the same topic always has the same color across the app. like the topic general gets the same color on its badge everywhere
 */
export const getTopicColor = (topicId: string): string => {
  if (!topicId) return "bg-yellow-400";

  const colors = [
    "bg-red-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-indigo-400",
    "bg-orange-400",
    "bg-teal-400",
    "bg-cyan-400",
  ];

  
  let hash = 0;
  for (let i = 0; i < topicId.length; i++) {
    hash = topicId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};