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
  display: string = ''; // 入力されている数式
  prevIsOperator: boolean = false; // 直前が演算子かどうか
  resultDisplayed: boolean = false; // 結果が表示されているかどうか

  press(value: string): void {
    // 結果が表示されているときに、新しい入力があった場合は結果をクリア
    if (this.resultDisplayed) {
      // すでに結果が表示されている場合、次に入力する値を結果として設定する
      if (this.isOperator(value)) {
        // 演算子が入力された場合は結果に続けて計算できるようにする
        this.display = this.display + value;
        this.resultDisplayed = false;
      } else {
        // 数字が入力された場合、新しい計算として扱う
        this.display = value;
        this.resultDisplayed = false;
      }
    } else {
      // 演算子が連続して入力されないようにする
      if (this.isOperator(value)) {
        if (this.prevIsOperator || this.display === '') {
          return; // 連続した演算子の入力を防止
        }
        this.prevIsOperator = true;
      } else {
        this.prevIsOperator = false;
        if (!this.canAddValue(value)) {
          return; // 無効な値が入力された場合は無視
        }
      }

      // 入力された値を表示に追加
      this.display += value;
    }

    this.scrollToEnd();
  }

  private canAddValue(value: string): boolean {
    const next = this.display + value;
    const lastNumberMatch = next.match(/(\d+(\.\d*)?)$/);
    if (!lastNumberMatch) return true;

    const [integerPart, decimalPart] = lastNumberMatch[0].split('.');
    if (integerPart.length > 10 || (decimalPart && decimalPart.length > 8)) {
      return false;
    }

    return !isNaN(parseFloat(next)) && parseFloat(next) <= 9999999999.99999999;
  }

  private scrollToEnd(): void {
    const displayElement = document.getElementById('display');
    if (displayElement) {
      displayElement.scrollLeft = displayElement.scrollWidth;
    }
  }

  evaluate(): void {
    try {
      const result = this.calculate(this.display); // 数式の評価

      // 計算結果が10000000000以上の場合にエラー表示
      if (result >= 10000000000) {
        this.display = 'Error';
      } else {
        this.display = this.formatResult(result);
      }
    } catch {
      this.display = 'Error';
    }
    this.resultDisplayed = true;
  }

  // 数式を計算する関数
  private calculate(expression: string): number {
    const tokens = this.tokenize(expression);
    const values: number[] = [];
    const operators: string[] = [];

    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];

      if (this.isNumber(token)) {
        values.push(parseFloat(token));
      } else if (this.isOperator(token)) {
        while (
          operators.length &&
          this.hasPrecedence(token, operators[operators.length - 1])
        ) {
          values.push(this.applyOperator(values.pop()!, values.pop()!, operators.pop()!));
        }
        operators.push(token);
      }
      i++;
    }

    while (operators.length) {
      values.push(this.applyOperator(values.pop()!, values.pop()!, operators.pop()!));
    }

    return values.pop()!;
  }

  // 数式をトークンに分割する関数
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

  // 演算子の優先順位をチェック
  private hasPrecedence(op1: string, op2: string): boolean {
    if ((op1 === '*' || op1 === '/') && (op2 === '+' || op2 === '-')) {
      return false; // '*' と '/' は '+' と '-' より優先される
    }
    return true;  // それ以外の組み合わせでは、優先度を考慮しない
  }

  // 演算を適用
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

  private formatResult(value: number): string {
    let resultStr = value.toFixed(8); // 小数点以下第9位で切り捨て
    return resultStr.replace(/\.?0+$/, ''); // 不要なゼロを削除
  }

  deleteLast(): void {
    this.display = this.display.slice(0, -1);
    this.prevIsOperator = this.isOperator(this.display.slice(-1));
  }

  clear(): void {
    this.display = '';
    this.prevIsOperator = false;
    this.resultDisplayed = false;
  }
}
