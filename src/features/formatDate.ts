// format date in format 2017-08-16 07:27:27
export default function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1);
  const day = addZero(date.getDate());
  const hour = addZero(date.getHours());
  const minute = addZero(date.getMinutes());
  const second = addZero(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// Add 0 for numbers < 10
function addZero(time: number): string {
  return time < 10 ? "0" + time : time.toString();
}
