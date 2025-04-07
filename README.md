# 課題１：計算機アプリ

このプロジェクトは、Angularを使用して作成したシンプルな電卓アプリケーションです。数式の入力、計算、および結果の表示を行います。

## 要件
・四則演算が可能であること
・10億の桁まで計算できること
・小数点は最大8位まで表示できること

## 前回提出時からの修正点
①クリア機能の改善
計算結果や計算途中の入力内容をすべて削除する「ACボタン」と、直前の１つの入力のみを削除する「⌫」ボタンを実装しました。

②小数点最大８位まで表示
小数点の入力は９位以降は不可になるようにしました。また、計算結果は、８位まで表示し９以降は切り捨てるようにしました。