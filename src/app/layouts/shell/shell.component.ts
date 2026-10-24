import { Component, inject, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { SidenavComponent } from '../sidenav/sidenav.component';



interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  imports: [RouterOutlet, MatSidenavModule, ToolbarComponent, SidenavComponent],
  standalone: true,
  selector: 'app-shell',
  styleUrl: './shell.component.scss',
  templateUrl: './shell.component.html',
})
export class ShellComponent {
   
    @ViewChild('sidenav') sidenav!: MatSidenav;
    private breakpointObserver = inject(BreakpointObserver);

    isHandset = this.breakpointObserver.isMatched(Breakpoints.Handset);


    toggleSidenav() {
        this.sidenav.toggle();
    }
}
