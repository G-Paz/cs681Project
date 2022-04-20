import { Component, OnInit } from "@angular/core";
import { Profile } from "src/app/model/profile";
import { User } from "src/app/model/user";
import { DelegateService } from "src/app/service/delegate.service";
import { IamService } from "src/app/service/iam.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
  profile: Profile;
  user: User;

  constructor(
    private delegateService: DelegateService,
    private iamService: IamService
  ) {
    this.profile = this.delegateService.profileValue
    this.delegateService.profileSubject.subscribe((x) => {
      this.profile = x;
      console.log(x)
    });
    this.user = this.iamService.userValue;
  }

  ngOnInit(): void {
    const user = this.iamService.userValue;
    this.delegateService.getProfile(user.id, user.token);
  }

  getTopPlayers(){
    return this.profile.topPlayers
  }

  initProfile(loadedProfile: Profile) {
    this.profile = loadedProfile;
  }

  returnHome() {
    return false;
  }
}
