export class CaseInsensitiveMap<V> extends Map<string, V> {
  set(key: string, value: V) {
    return super.set(key.toLowerCase(), value);
  }

  get(key: string): V | undefined {
    return super.get(key.toLowerCase());
  }
}
