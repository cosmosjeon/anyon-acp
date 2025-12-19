// 테스트용 보안 이슈 파일 v3
export function deleteUser(userId: string) {
  // SQL Injection 취약점
  const query = `DELETE FROM users WHERE id = ${userId}`;
  
  // Hardcoded secret
  const SECRET = "my-super-secret-api-key";
  
  return { query, SECRET };
}
