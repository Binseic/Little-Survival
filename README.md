# 🦇 Vampire Survivors 2D (뱀서라이크) - Canvas Web Edition

> **외부 이미지나 오디오 파일 없이 순수 Canvas 2D API와 Web Audio API만으로 구현된 고성능 2D 뱀서라이크(Vampire Survivors-like) 액션 서바이벌 웹 게임**입니다.  
> React + Vite 기반의 반응형 웹 애플리케이션으로 실행되며, 클릭 한 번으로 **완전 독립 실행형 단일 HTML 파일(`standalone_vampire_survivors.html`)**로 다운로드하여 서버 없이 더블 클릭만으로 플레이할 수 있습니다.

---

## 📌 목차 (Table of Contents)
1. [프로젝트 소개 (Overview)](#-프로젝트-소개-overview)
2. [핵심 게임 사양 (Core Game Features)](#-핵심-게임-사양-core-game-features)
3. [소스 코드 구조 및 파일별 상세 분석 (Source Code Analysis)](#-소스-코드-구조-및-파일별-상세-분석-source-code-analysis)
   - [`src/App.tsx`: 메인 게임 루프 & UI 엔진](#1-srcapptsx)
   - [`src/game/types.ts`: 데이터 모델 및 타입 인터페이스](#2-srcgametypests)
   - [`src/game/audio.ts`: 순수 Web Audio API 사운드 신디사이저](#3-srcgameaudiots)
   - [`src/game/standaloneHtml.ts` & `standalone_vampire_survivors.html`](#4-srcgamestandalonehtmlts--standalone_vampire_survivorshtml)
4. [수학적 알고리즘 & 연출 공식 (Algorithms & Mechanics)](#-수학적-알고리즘--연출-공식-algorithms--mechanics)
5. [조작법 (Controls)](#-조작법-controls)
6. [설치 및 실행 가이드 (Getting Started)](#-설치-및-실행-가이드-getting-started)

---

## 🎮 프로젝트 소개 (Overview)

이 프로젝트는 인기 로그라이크 액션 게임 *Vampire Survivors*의 핵심 재미 요소를 웹 브라우저 환경에서 최적의 프레임레이트(60FPS)로 즐길 수 있도록 구현한 게임입니다.

- **Zero External Assets**: PNG, JPG 등 외부 텍스처나 이미지 에셋 없이 HTML5 Canvas 2D 컨텍스트의 기본 경로(Path), 도형(Arc, Rect), 그라데이션, 그림자(Shadow Blur) 효과만으로 캐릭터, 몬스터, 무기 투사체 및 이펙트를 실시간 절차적으로 렌더링합니다.
- **Zero Audio Files**: MP3, WAV 등 음원 파일 없이 브라우저 내장 **Web Audio API** 오실레이터(OscillatorNode)와 게인 노드(GainNode)의 주파수 변조를 통해 8비트 레트로 SFX 및 배경음악을 즉석 합성합니다.
- **Standalone Single File Ready**: 웹 앱 내에서 플레이할 뿐만 아니라, 언제든지 순수 HTML+CSS+JS로 번들링된 독립형 단일 HTML 파일을 다운로드하거나 코드를 복사할 수 있습니다.

---

## ✨ 핵심 게임 사양 (Core Game Features)

### 1. 플레이어 중심 무한 맵 카메라 (Infinite Tiled Grid)
- 플레이어는 화면 정중앙 `(width / 2, height / 2)`에 항상 고정됩니다.
- 카메라 오프셋(`camX`, `camY`)에 따라 고딕 판타지 격자 바닥 타일과 필드 룬 문양이 끊김 없이 무한 스크롤됩니다.

### 2. 자동 공격 전투 시스템 (Auto Combat)
- 마우스 클릭 없이 장착된 무기가 쿨타임마다 적을 자동으로 타겟팅하여 공격합니다.
  - **마법 화살 (Magic Missile)**: 유클리드 거리 기준으로 가장 가까운 적을 탐지하여 고속 마법 화살을 발사합니다. (레벨업 시 발사체 개수 증가, 관통력 부여)
  - **회전 성스러운 오라 (Spinning Holy Aura)**: 플레이어 주위를 원형 궤도로 영구 공전하는 구체로, 접근하는 적들에게 연속 데미지와 넉백을 가합니다.
  - **번개 낙뢰 (Thunderbolt)**: 필드 내 무작위 적에게 강력한 벼락을 내리꽂아 치명타와 지그재그 전격 이펙트를 부여합니다.

### 3. 적 스폰 & 웨이브 난이도 스케일링
- 화면 밖 4방향 모서리에서 지속 생성되며, 시간이 지날수록 적의 HP, 속도, 스폰 빈도가 점진적으로 증가합니다:
  - **박쥐 (Bat)**: 날개를 펄럭이는 빠른 비행 몬스터 (대규모 떼 지어 출현)
  - **좀비 (Zombie)**: 느리지만 체력이 높은 근접 공격 몬스터
  - **해골 전사 (Skeleton)**: 균형 잡힌 기동성과 방어력을 가진 몬스터
  - **붉은 악마 (Elite Demon)**: 높은 체력과 위력을 지닌 대형 엘리트 몬스터
  - **보스 (Gargoyle / Giant Skull)**: 주기적으로 경보(Alert)와 함께 등장하는 거대 보스 몬스터

### 4. ⏳ 15분 무적의 사신(Grim Reaper) 이벤트
- 게임 시간 **15분(900초)**에 도달하면 불길한 죽음의 종소리와 함께 **무적의 사신(The Reaper)**이 강림합니다.
- 사신은 플레이어보다 빠른 속도로 추격하며, 모든 공격에 대해 `무적(IMMUNE)` 판정을 가집니다.
- 사신이 플레이어에게 닿는 순간 9,999의 치명적인 데미지를 입히며 영혼을 거두어 게임이 종료됩니다.
- *개발/테스트용 편의 기능*: 상단에 **`⚡ 15분 사신 소환(테스트)`** 버튼을 제공하여 15분을 대기하지 않고도 즉시 이벤트를 발동할 수 있습니다.

### 5. 경험치 보석 & 자석 연출 & 3택 레벨업 시스템
- 적 처치 시 청색/녹색/적색 경험치 보석이 드롭됩니다.
- 플레이어의 자석 범위(`magnetRadius`) 내에 들어온 보석은 가속도를 받으며 부드러운 호를 그리며 플레이어에게 흡수됩니다.
- 레벨업 시 게임 루프가 정지(Pause)되고 5음계 축하 팡파르와 함께 3가지 무작위 강화 옵션 모달이 출력됩니다.

### 6. 종합 결과 및 정산 정보창 (Post-Game Summary Window)
- 게임 종료 시 세부적인 플레이 기록을 시각화합니다:
  - **사망 원인**: 사신의 일격 vs 마물들의 공세
  - **경험치 상세 정산**: 내가 먹은 총 경험치 (누적 EXP), 종료 시점 보유 경험치, 다음 레벨까지 남은 경험치 및 달성률(%)
  - **전투 통계**: 받은 총 피해량 (Damage Taken), 적에게 가한 총 피해량 (Damage Dealt), 총 처치 수, 생존 시간, 최종 레벨
  - **최고 기록**: 브라우저 `localStorage`에 자동 보관되는 최고 생존 시간 및 처치 기록

---

## 📂 소스 코드 구조 및 파일별 상세 분석 (Source Code Analysis)

```
├── index.html                           # 애플리케이션 진입 HTML
├── metadata.json                        # AI Studio 앱 명칭 및 권한 메타데이터
├── package.json                         # 의존성 및 스크립트 정의
├── standalone_vampire_survivors.html    # 100% 독립 실행 가능한 단일 HTML 게임 파일
├── src/
│   ├── main.tsx                         # React 19 진입점
│   ├── App.tsx                          # 메인 게임 루프, 렌더러, HUD & UI 컴포넌트
│   ├── index.css                        # Tailwind CSS 및 기본 글로벌 스타일
│   └── game/
│       ├── types.ts                     # 게임 엔티티, 무기, 통계 타입 인터페이스
│       ├── audio.ts                     # Web Audio API 기반 순수 사운드 신디사이저
│       └── standaloneHtml.ts            # 단일 HTML 코드 동적 문자열 생성기
```

---

### 1. `src/App.tsx`
게임의 핵심 엔진과 UI가 통합된 중앙 컨트롤러입니다.

- **Ref 기반 가변 상태 관리 (`gameStateRef`)**:
  - React의 리렌더링 오버헤드로 인한 프레임 드랍을 방지하기 위해 플레이어, 몬스터 목록(`enemies`), 투사체(`projectiles`), 파티클(`particles`), 데미지 텍스트(`damageNumbers`) 등 고빈도 변경 데이터를 `useRef` 내에서 순수 가변 객체로 관리합니다.
  - HUD 게이지, 모달 창, 타이머 등 유저 인터페이스 상태만 React `useState`를 통해 효율적으로 동기화합니다.
- **60FPS 애니메이션 루프 (`requestAnimationFrame`)**:
  - 델타 타임(`dt = (timestamp - lastFrameTime) / 1000`)을 기반으로 물리 연산과 좌표를 갱신하여 주사율에 상관없이 일정한 속도를 유지합니다.
- **Canvas 2D 렌더러 (`render`)**:
  - 무한 바닥 타일 그리기 ➔ 드롭 보석 ➔ 마법 투사체 ➔ 번개 전격 ➔ 몬스터(사신 전용 그래픽 포함) ➔ 플레이어 및 머리 위 HP 바 ➔ 회전 오라 구체 ➔ 파티클 ➔ 부유 데미지 텍스트 순서의 계층적 렌더링 파이프라인을 실행합니다.

---

### 2. `src/game/types.ts`
TypeScript의 정적 타이핑을 적용하여 객체 구조와 데이터 모델을 명확히 정의합니다.

- `MonsterType`: `'bat' | 'zombie' | 'skeleton' | 'ghost' | 'demon' | 'boss' | 'reaper'`
- `Enemy`: 몬스터의 위치, 속도, HP, 반경, 색상, 피격 플래시 타이머, 무적 여부(`isInvincible`) 등을 정의.
- `Player`: 플레이어 스탯(이동속도, 최대 체력, 치명타 확률/배수, 자석 반경, 쿨타임 감소율, 공격력 증폭 배수)과 각 무기별 강화 상태.
- `RunStatistics`: 게임 종료 시 정보창에 표시할 누적 경험치, 보유 경험치, 피해량 등의 종합 정산 데이터 구조.

---

### 3. `src/game/audio.ts`
외부 오디오 파일을 단 하나도 사용하지 않는 순수 **Web Audio API** 사운드 엔진입니다.

- **마법 화살 사운드 (`playShoot`)**: 삼각파(Triangle) 오실레이터 주파수를 620Hz에서 120Hz로 지수 감쇠(Exponential Ramp)시켜 날카로운 발사음 생성.
- **오라 타격음 (`playAuraHit`)**: 톱니파(Sawtooth) 180Hz에서 90Hz로 선형 감쇠시켜 금속 회전체의 마찰음 연출.
- **보석 습득음 (`playGem`)**: 사인파(Sine) 523Hz(C5) 이상의 맑은 크리스탈 차임 사운드.
- **레벨업 팡파르 (`playLevelUp`)**: A 메이저 아르페지오 (440Hz, 554Hz, 659Hz, 880Hz, 1108Hz)를 0.08초 간격으로 순차 재생.
- **사신 강림 종소리 (`playReaperBell`)**: 110Hz, 220Hz, 277Hz, 440Hz의 저주파수 배음을 결합하여 1.8초 동안 길게 울려 퍼지는 장엄한 죽음의 종소리 합성.
- **사신의 낫 베기음 (`playReaperSlash`)**: 800Hz 톱니파를 30Hz로 급격히 떨어뜨리며 묵직한 공기 가르기 타격음 발생.
- **8비트 배경음악 생성기 (`startBgm`)**: 180ms 간격으로 아르페지오 베이스 펄스와 하이햇 틱을 순환 연주하는 절차적 BGM 엔진 내장.

---

### 4. `src/game/standaloneHtml.ts` & `standalone_vampire_survivors.html`
- 사용자의 요구사항인 *"단일 HTML 파일(HTML+CSS+JS)로 실행 가능한 2D 웹 뱀서라이크 게임 코드"*를 충족하기 위해 별도의 빌드 단계 없이도 실행 가능한 완벽한 단독 파일을 제공합니다.
- UI 상단의 **`단일 HTML 다운로드`** 및 **`코드 복사`** 버튼을 누르면 이 소스가 즉시 전달됩니다.

---

## 📐 수학적 알고리즘 & 연출 공식 (Algorithms & Mechanics)

1. **무한 맵 카메라 변환 공식**:
   $$\text{camX} = \frac{W}{2} - P_x, \quad \text{camY} = \frac{H}{2} - P_y$$
   화면 좌표계를 플레이어 위치만큼 반대로 평행 이동(`ctx.translate(camX, camY)`)하여 플레이어를 항상 중심에 배치합니다.

2. **경험치 보석 자석 가속 물리 (Magnet Attraction Physics)**:
   플레이어와 보석 사이의 유클리드 거리 $d = \sqrt{(P_x - I_x)^2 + (P_y - I_y)^2}$가 자석 반경 $R_{\text{magnet}}$ 이하일 때:
   $$\theta = \text{atan2}(P_y - I_y, P_x - I_x)$$
   $$V_{\text{pull}} = V_{\text{base}} + (R_{\text{magnet}} - d) \times k$$
   $$I_x \leftarrow I_x + \cos(\theta) \cdot V_{\text{pull}}, \quad I_y \leftarrow I_y + \sin(\theta) \cdot V_{\text{pull}}$$
   가까워질수록 더 빠른 가속도로 부드럽게 빨려 들어옵니다.

3. **회전 오라 궤도 계산 (Circular Orbital Positioning)**:
   오라 개수 $N$, 현재 각도 $\theta$, 궤도 반지름 $R$일 때 $i$번째 오라의 좌표:
   $$O_x = P_x + R \cos\left(\theta + \frac{2\pi}{N} \cdot i\right)$$
   $$O_y = P_y + R \sin\left(\theta + \frac{2\pi}{N} \cdot i\right)$$

4. **스폰 주기 스케일링 공식 (Dynamic Difficulty Scaling)**:
   시간 $T$초 경과에 따른 스폰 간격:
   $$I_{\text{spawn}} = \max\left(0.18, 1.0 - \frac{T}{180} \times 0.75\right)$$

---

## 🕹️ 조작법 (Controls)

| 구분 | PC (키보드) | 모바일 / 터치 |
| :--- | :--- | :--- |
| **이동** | `W`, `A`, `S`, `D` 또는 `방향키` | 좌측 하단 가상 아날로그 조이스틱 드래그 |
| **공격** | **자동 공격** (조작 불필요) | **자동 공격** (조작 불필요) |
| **일시정지** | `P` 키 또는 우측 상단 `⏸` 버튼 | 우측 상단 `⏸` 버튼 |
| **사운드 토글** | 우측 상단 `🔊` / `🎵` 버튼 | 우측 상단 `🔊` / `🎵` 버튼 |
| **15분 사신 즉시 소환** | 우측 상단 `⚡ 15분 사신 소환` 버튼 | 우측 상단 `⚡ 15분 사신 소환` 버튼 |

---

## 🚀 설치 및 실행 가이드 (Getting Started)

### 방법 A: 독립형 단일 HTML 파일로 즉시 실행 (가장 간단)
1. 프로젝트 루트의 `standalone_vampire_survivors.html` 파일을 Chrome, Edge, Safari 등 최신 웹 브라우저로 **더블 클릭하여 열기**만 하면 즉시 플레이할 수 있습니다.

### 방법 B: Node.js 개발 서버로 실행
```bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 실행 (포트 3000)
npm run dev

# 3. 브라우저 접속
# http://localhost:3000
```

### 빌드 및 검사
```bash
# 타입스크립트 문법 및 린트 검사
npm run lint

# 프로덕션 빌드
npm run build
```

---

## 📜 라이선스 (License)
Apache-2.0 License. 자유롭게 수정하고 활용할 수 있습니다.
