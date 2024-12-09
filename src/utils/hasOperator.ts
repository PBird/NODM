const isOperator = (key: string): boolean => key.startsWith("$");

export default function hasOperator(query: Record<string, any>) {
  const keys = Object.keys(query);

  return keys.findIndex(isOperator) > -1 ? true : false;
}
