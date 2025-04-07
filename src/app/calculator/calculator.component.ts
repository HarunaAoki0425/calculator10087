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
      const result = eval(this.display);  // 数式の評価

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

  private formatResult(value: number): string {
    let resultStr = value.toFixed(8); // 小数点以下第9位で切り捨て
    return resultStr.replace(/\.?0+$/, ''); // 不要なゼロを削除
  }

  deleteLast(): void {
    this.display = this.display.slice(0, -1);
    this.prevIsOperator = this.isOperator(this.display.slice(-1));
  }

  private isOperator(value: string): boolean {
    return ['+', '-', '*', '/'].includes(value);
  }

  clear(): void {
    this.display = '';
    this.prevIsOperator = false;
    this.resultDisplayed = false;
  }
}
