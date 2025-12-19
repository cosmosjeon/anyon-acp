// 테스트용 보안 이슈 파일 v2
export function deleteUser(userId: string) {
  // SQL Injection 취약점 (의도적)
  const query = `DELETE FROM users WHERE id = ${userId}`;
  console.log("executing:", query);
  
  // Hardcoded secret (의도적)
  const API_KEY = "sk-secret-key-12345";
  
  return { query, API_KEY };
}
