export default function getInitials(nameStr: string) {
  if (!nameStr || !nameStr.trim()) return "U";
  const parts = nameStr.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return nameStr.substring(0, 2).toUpperCase();
}
