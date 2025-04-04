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
        if (this.resultDisplayed && !this.isOperator(value)) {
            // 計算結果が表示されていて、新たに数字が入力されたらクリア
            this.display = '';
        }
        if (this.isOperator(value) && this.prevIsOperator) {
            return; // 連続して演算子が入力されるのを防ぐ
        }

        this.display += value;
        this.prevIsOperator = this.isOperator(value);
        this.resultDisplayed = false; 
    }

    // 表示をクリア
    clear(): void {
      this.display = '';
      this.prevIsOperator = false
      this.resultDisplayed = false;
  }
  

    // 計算
    evaluate(): void {
        try {
            const result = new Function('return ' + this.display)();
            if (result > 9999999999) {
                this.display = 'Error';
            } else {
                this.display = parseFloat(result.toFixed(8)).toString();
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

     // + - * / の判定
    private isOperator(value: string): boolean {
        return ['+', '-', '*', '/'].includes(value);
    }
}
