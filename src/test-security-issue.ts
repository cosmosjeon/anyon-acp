// 테스트용 보안 이슈 파일
export function deleteUser(userId: string) {
  // SQL Injection 취약점 (의도적)
  const query = `DELETE FROM users WHERE id = ${userId}`;
  console.log(query);
  
  // Hardcoded secret (의도적)
  const API_KEY = "sk-1234567890abcdef";
  
  return { query, API_KEY };
}
