describe('test setup', () => {
  it('shows why money is stored in integer paise', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(10 + 20).toBe(30);
  });
});
