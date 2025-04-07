import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  display: string = '';  
  prevIsOperator: boolean = false; 
  resultDisplayed: boolean = false; 

  // ボタンを押したときの処理
  press(value: string): void {
    // 結果が表示された後に何か入力された場合の処理
    if (this.resultDisplayed) {
      if (this.isOperator(value)) {
        // 演算子の場合、計算式の後ろに追加
        this.display = this.display + value;
        this.resultDisplayed = false;
      } else {
        // 数字の場合、新しい計算式として設定
        this.display = value;
        this.resultDisplayed = false;
      }
    } else {
      // 演算子が押された場合の処理
      if (this.isOperator(value)) {
        if (this.prevIsOperator || this.display === '') {
          // 連続して演算子が入力されることを防ぐ
          return;
        }
        this.prevIsOperator = true;
      } else {
        this.prevIsOperator = false;
        // 数字または小数点が入力された場合
        if (!this.canAddValue(value)) {
          return;
        }
      }
      this.display += value;
    }
  
    // 入力後にスクロール位置を調整
    this.scrollToEnd();
  }

  // 数字と小数点の形式で値が追加できるか確認する
  private canAddValue(value: string): boolean {
    const next = this.display + value;
    const lastNumberMatch = next.match(/(\d+(\.\d*)?)$/);
    if (!lastNumberMatch) return true;

    const [integerPart, decimalPart] = lastNumberMatch[0].split('.');
    // 整数部分が10桁以上または小数部分が8桁以上なら入力不可
    if (integerPart.length > 10 || (decimalPart && decimalPart.length > 8)) {
      return false;
    }

    return !isNaN(parseFloat(next)) && parseFloat(next) <= 9999999999.99999999;
  }

  // 入力後にスクロールバーを一番右に移動させる
  private scrollToEnd(): void {
    const displayElement = document.getElementById('display');
    if (displayElement) {
      displayElement.scrollLeft = displayElement.scrollWidth;  // スクロール位置を右端に調整
    }
  }

  // 「=」が押されたときに実行される計算処理
  evaluate(): void {
    try {
      const result = this.calculate(this.display);

      // 100億以上はエラー
      if (result >= 10000000000) {
        this.display = 'Error';
      } else {
        // 結果を表示
        this.display = this.formatResult(result);
      }
    } catch {
      this.display = 'Error';  // エラー
    }
    this.resultDisplayed = true;
  }

  // 数式の計算
  private calculate(expression: string): number {
    const tokens = this.tokenize(expression);  // 数式をトークンに分解
    const values: number[] = [];  // 値
    const operators: string[] = [];  // 演算子

    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];

      // 数字の場合はスタックにプッシュ
      if (this.isNumber(token)) {
        values.push(parseFloat(token));
      } else if (this.isOperator(token)) {
        // 演算子の場合は適切な順序で計算
        while (
          operators.length &&
          this.hasPrecedence(token, operators[operators.length - 1])
        ) {
          const b = values.pop()!;  // スタックから2つの値を取り出す
          const a = values.pop()!;
          const op = operators.pop()!;
          values.push(this.applyOperator(a, b, op));  // 演算結果をスタックに戻す
        }
        operators.push(token);  // 演算子をスタックに保存
      }
      i++;
    }

    // 演算子が残っていれば順番に計算
    while (operators.length) {
      const b = values.pop()!;
      const a = values.pop()!;
      const op = operators.pop()!;
      values.push(this.applyOperator(a, b, op));
    }

    return values.pop()!;  // 結果
  }

  // 数式をトークンに分解するメソッド（数字と演算子に分ける）
  private tokenize(expression: string): string[] {
    const regex = /\d+(\.\d*)?|\+|\-|\*|\//g;
    return expression.match(regex) || [];
  }

  // 数字かどうかを判定
  private isNumber(value: string): boolean {
    return !isNaN(parseFloat(value));
  }

  // 演算子かどうかを判定
  private isOperator(value: string): boolean {
    return ['+', '-', '*', '/'].includes(value);
  }

  // ×÷は＋－より優先
  private hasPrecedence(op1: string, op2: string): boolean {
    if ((op1 === '*' || op1 === '/') && (op2 === '+' || op2 === '-')) {
      return false;
    }
    return true;
  }

  // 計算を実行
  private applyOperator(a: number, b: number, op: string): number {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        if (b === 0) throw new Error("Cannot divide by zero");
        return a / b;
      default:
        throw new Error("Unknown operator");
    }
  }

  // 結果表示
  private formatResult(value: number): string {
    let resultStr = value.toFixed(8);
    return resultStr.replace(/\.?0+$/, '');  // 小数点以下の0を削除
  }

  // 直前の入力だけ削除
  deleteLast(): void {
    this.display = this.display.slice(0, -1);
    this.prevIsOperator = this.isOperator(this.display.slice(-1));
  }

  // 全部削除
  clear(): void {
    this.display = '';
    this.prevIsOperator = false;
    this.resultDisplayed = false;
  }
}
