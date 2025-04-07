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

  press(value: string): void {
    if (this.resultDisplayed) {
      this.display = '';
      this.resultDisplayed = false;
    }
  
    if (this.isOperator(value)) {
      if (this.prevIsOperator || this.display === '') {
        return;
      }
      this.prevIsOperator = true;
    } else {
      this.prevIsOperator = false;
  
      // 入力制限のチェック（数字か小数点の場合）
      if (!this.canAddValue(value)) {
        return;
      }
    }
  
    this.display += value;

    const displayElement = document.getElementById('display');
    if (displayElement) {
        displayElement.scrollLeft = displayElement.scrollWidth;
    }
  }
  
  private canAddValue(value: string): boolean {
    const next = this.display + value;
  
    // 数式の最後の数値部分だけ抽出
    const lastNumberMatch = next.match(/(\d+(\.\d*)?)$/);
    if (!lastNumberMatch) return true; // 数字がないなら制限かけない
  
    const number = lastNumberMatch[0];
  
    // 整数・小数に分ける
    const [integerPart, decimalPart] = number.split('.');
    if (integerPart.length > 10) return false;
    if (decimalPart && decimalPart.length > 8) return false;
  
    // 入力が浮動小数点として許容範囲か？
    try {
      const valueAsNum = parseFloat(next);
      if (valueAsNum > 9999999999.99999999) return false;
    } catch {
      return false;
    }
  
    return true;
  }

  clear(): void {
    this.display = '';
    this.prevIsOperator = false;
    this.resultDisplayed = false;
  }

  evaluate(): void {
    try {
      // 計算を行う
      const result = eval(this.display);  // 数式の評価を行う
  
      // 結果が制限を超えている場合はエラーにする
      if (result > 9999999999.99999999) {
        this.display = 'Error';
      } else {
        // 小数点以下第9位を切り捨てて表示（toFixed(8)で小数点以下8桁にする）
        let resultStr = this.toFixedPrecision(result, 8);
        
        // 小数点以下があればゼロを省略
        if (resultStr.indexOf('.') !== -1) {
          // 小数点以下があった場合、末尾の不要なゼロを削除
          resultStr = resultStr.replace(/\.?0+$/, '');
        }
        
        this.display = resultStr;
      }
    } catch {
      this.display = 'Error';
    }
    this.resultDisplayed = true;
  }
  
  

  deleteLast(): void {
    this.display = this.display.slice(0, -1);
    this.prevIsOperator = this.isOperator(this.display.slice(-1));
  }

  private isOperator(value: string): boolean {
    return ['+', '-', '*', '/'].includes(value);
  }

  // 精度を保持して数値を切り捨てる関数
  private toFixedPrecision(value: number, decimals: number): string {
    if (isNaN(value)) return 'Error';
    const factor = Math.pow(10, decimals);
    const result = Math.floor(value * factor) / factor;
    return result.toFixed(decimals);  // 指定桁数で結果を返す
  }
}
