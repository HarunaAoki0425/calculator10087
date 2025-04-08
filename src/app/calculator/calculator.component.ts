import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
    selector: 'app-calculator',
    standalone: true,
    templateUrl: './calculator.component.html',
    styleUrls: ['./calculator.component.css'],
    imports: [CommonModule, FormsModule] 
})
export class CalculatorComponent {
    display: string = ''; // 表示
    prevIsOperator: boolean = false; // 直前が演算子かどうか
    resultDisplayed: boolean = false; // 計算結果が表示されたかどうか

    // ボタンを押したときの処理
    press(value: string): void {

        // 計算結果が表示されてるとき、演算子以外が入力されたらクリア
        if (this.resultDisplayed && !this.isOperator(value)) {
            this.display = ''; // 数字の場合はクリア→次の計算、演算子の場合はその数字から続けて計算
        }

        // 小数点の直後に演算子、小数点、= は入力不可
        const lastChar = this.display[this.display.length - 1];
        if (lastChar === '.' && (this.isOperator(value) || value === '.' || value === '=')) {
           return;
        }

        // -以外の演算子は計算の最初に入力できないようにする
        if (this.isOperator(value) && this.display === '' && value !== '-') {
             return;
        }

        // 数字と小数点の形式で値が追加できるか確認する
        if (!this.canAddValue(value)) {
             return;
        }

        // 演算子は連続で入力できない（-は一度だけ連続入力可）
        if (this.isOperator(value)) {
         const lastChar = this.display[this.display.length - 1];
           if (this.isOperator(lastChar)) {
             // -は+*/の後には連続入力可（- -となるのを防ぐ）
              if (value === '-' && ['+', '*', '/'].includes(lastChar)) {
             } else {
              return; // その他の演算子連続はNG
             }
             }
        }

        // 最初に0が入力された場合、次に数字は入力できないようにする（演算子と小数点は入力できる）
        if (this.display === '0' && !(this.isOperator(value) || value === '.')) {
          return; 
        }

        // 直前が「0」で、その前が演算子の場合、数字の入力を防ぎ、演算子や小数点は入力できるようにする
        if (this.display.length > 1 && this.display[this.display.length - 1] === '0' && this.isOperator(this.display[this.display.length - 2])) {
          if (this.isOperator(value) || value === '.') {
          // 演算子または小数点は入力できる
          this.display += value;
           }
              return; // 数字だけ入力できない
        }

        //小数点が入力されるとき
        if (value === '.') { 
          // 直前が演算子か空欄の場合は0.と表示
          if (this.prevIsOperator || this.display === '') {
              this.display += '0.';
          } else {
              const parts = this.display.split(/[\+\-\*\/]/);// 演算子で数値ごとに分割
              if (parts[parts.length - 1].includes('.')) {
                  return; // 分割した数値の中に小数点がある場合は入力不可
              }
              this.display += value;
          }
        } else {
          this.display += value;  // それ以外は通常の入力
      }

        this.prevIsOperator = this.isOperator(value);
        this.resultDisplayed = false;
    }

    // 計算
    evaluate(): void {
      try {
          // 数式を評価
          const result = new Function('return ' + this.display)();
          // 結果が数値であれば処理を行う
          if (typeof result === 'number') {
              if (Number.isInteger(result)) {
                  this.display = result.toString();  // 整数の場合はそのまま表示
              } else {
                this.display = parseFloat(result.toFixed(8)).toString(); // 小数点第9位以降は切り捨て
              }
              if (!isFinite(result)) {
                this.display = '未定義';
              }
          } else {
            this.display = 'Error';
          }
      } catch {
          this.display = 'Error';
      }
  
      this.resultDisplayed = true;
    }

    // 直前の入力を削除
    deleteLast(): void {
        this.display = this.display.slice(0, -1);
        this.prevIsOperator = this.isOperator(this.display.slice(-1));
    }

    // 表示をクリア
    clear(): void {
        this.display = '';
        this.prevIsOperator = false;
        this.resultDisplayed = false;
    }

    // + - * / の判定
    private isOperator(value: string): boolean {
        return ['+', '-', '*', '/'].includes(value);
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
}
