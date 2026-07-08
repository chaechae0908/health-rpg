# 건강지킴이 RPG — Firebase 연동

## Firebase Console 설정 (필수)

1. [Firebase Console](https://console.firebase.google.com/) → 프로젝트 `chaechae-1e084`
2. **Authentication** → 로그인 방법 → **이메일/비밀번호** 사용 설정
3. **Firestore Database** → 데이터베이스 만들기 (테스트 모드 또는 아래 규칙 배포)
4. **Storage** → 시작하기 (퀘스트 사진 업로드용)

### Firestore 보안 규칙 (프로토타입)

프로젝트 루트의 `firestore.rules`를 Firebase Console → Firestore → 규칙에 붙여넣고 게시하세요.

### Storage 보안 규칙 (프로토타입)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## 실행

```bash
npm install
npm run dev
```

## 사용 흐름

1. **선생님 회원가입** → Firebase Auth 계정 생성 + 6자리 클래스 코드 자동 발급
2. **학생 추가** → Firestore `students` 컬렉션에 저장
3. **퀘스트·상점 등록** → `quests`, `shopItems` 컬렉션
4. **학생 로그인** → 클래스 코드 + 학번 + 비밀번호
5. **퀘스트 제출** → Storage에 사진 업로드 + `requests` 컬렉션
6. **선생님 승인** → 학생 스탯·코인 실시간 반영

## Firestore 컬렉션 구조

| 컬렉션 | 주요 필드 |
|--------|-----------|
| `teachers/{uid}` | email, name, classCode |
| `students/{id}` | teacherId, classCode, studentNumber, nickname, password, str, cha, int, coins |
| `quests/{id}` | teacherId, classCode, title, description, rewardStat, rewardAmount |
| `shopItems/{id}` | teacherId, classCode, name, price, effect |
| `requests/{id}` | type (quest/shop), teacherId, classCode, studentId, status, photoUrl, ... |
