import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-custom-radio',
  templateUrl: './custom-radio.component.html',
  styleUrls: ['./custom-radio.component.scss'],
  imports:[
    CommonModule,
    IonicModule
  ],
})
export class CustomRadioComponent  implements OnInit {

  // Input properties to customize the component
  @Input() value: string = ''; // The selected value
  @Input() labelPlacement: 'start' | 'end' | 'stacked' | 'fixed' = 'start'; // Default label placement
  @Input() label: string = ''; // The label for the radio group
  @Input() required: boolean = true; // Whether selecting a radio button is required
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal'; // Layout for radio buttons
  @Input() options: { label: string; value: string }[] = []; // List of radio options

  // Output event to emit the selected value
  @Output() valueChange = new EventEmitter<string>();

  // Event handler when a radio option is selected
  onRadioChange(event: any): void {
    this.valueChange.emit(event.detail.value);
  }

  constructor() { }

  ngOnInit() {}

}
