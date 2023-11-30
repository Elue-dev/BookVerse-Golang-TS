export function showLogs(helper: string, data: any) {
  const formattedLog = JSON.stringify(data, null, 2);
  console.log(`${helper} =>`, formattedLog);
}
