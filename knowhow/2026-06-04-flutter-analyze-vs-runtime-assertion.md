# Flutter analyze 는 위젯 조립 런타임 assertion 을 못 잡는다 — 머지 전 네이티브 test 가 권위

`flutter analyze` 가 깨끗(0 error)해도 앱이 런타임에 터질 수 있다. analyze 는 **정적 분석**(타입·미사용·문법)만 보지, 위젯 트리가 실제로 조립될 때 걸리는 **런타임 assertion** 은 못 본다. 그래서 analyze-only 게이트 하나만 믿고 머지하면 빌드는 통과인데 화면에서 터지는 PR 이 main 에 들어간다.

## 대표 케이스 — Material ancestor

`ListTile` / `CheckboxListTile` / `Switch` 같은 Material 위젯은 위로 `Material` 조상이 있어야 한다. 색 카드를 만든다고 `DecoratedBox` / `Container(color:)` 안에 바로 넣으면:

```dart
DecoratedBox(
  decoration: BoxDecoration(color: cardColor),
  child: CheckboxListTile(...),   // ← Material ancestor 없음 → assertion throw / invisible
)
```

analyze 는 통과한다(타입·문법 멀쩡). 하지만 위젯 test 나 실기기에서 조립되는 순간 "No Material widget found" assertion. 복구는 투명 `Material` 로 감싸기:

```dart
DecoratedBox(
  decoration: BoxDecoration(color: cardColor),
  child: Material(
    type: MaterialType.transparency,   // 색은 DecoratedBox 가, Material 조상만 제공
    child: CheckboxListTile(...),
  ),
)
```

## 게이트 룰

- **노드의 Flutter PR 은 머지 전 본진 네이티브 `flutter test` 가 권위.** analyze PASS 만으로 머지 X.
- WSL 같은 비-네이티브 환경의 `run.sh analyze` 는 런타임 assertion 을 못 잡는 **반쪽 게이트** — 정적 통과 신호일 뿐.
- test FAIL 은 expanded 로그 끝까지 봐서 `EXCEPTION`/assertion 이면 **코드 버그**(stale 로그 아님)로 보고 fix.

## 실제 사고

노드(WSL)가 첫이름 입력 UX 를 `CheckboxListTile` 을 Material 없이 색 카드에 넣어 올렸고, analyze PASS 만 보고 머지 → main 4건 red(ListTile-in-DecoratedBox assertion). 본진이 `Material(transparency)` wrap 으로 복구. analyze-only 게이트의 한계가 드러난 케이스.
