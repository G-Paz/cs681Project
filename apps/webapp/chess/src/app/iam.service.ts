import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from "@angular/common/http";
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class IamService {
  constructor(private client: HttpClient) {}

  sendSurvey(data: any, callback: Function, router: Router) {
    console.log("called");
    this.client.get("https://localhost:8001/",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      observe: "response",
      responseType: "json",
    })
      .pipe()
      .subscribe( 
        (response) => {                           //Next callback
        console.log('response received')
        console.error('******************************')
        console.error(response)
        console.error('******************************')
      },
      (error) => {                              //Error callback
        console.error('******************************')
        console.error(error)
        console.error('******************************')
  
        //throw error;   //You can also throw the error to a global error handler
      }
      );
  }

  // loadSurveys(callback: Function, component: any) {
  //   this.client
  //     .get(
  //       "http://localhost:8080/survey/list-surveys",
        // {
        //   headers: {
        //     "Content-Type": "application/x-www-form-urlencoded",
        //   },
        //   observe: "response",
        //   responseType: "json",
        // }
  //     )
  //     .pipe()
  //     .subscribe(
  //       (res) => {
  //         callback(res.clone().body, component);
  //       },
  //       (err) => {
  //         this.handleError(err);
  //       }
  //     );
  // }

  // private genBody(data: any) {
  //   return new HttpParams()
  //     .set("firstName", data.firstName)
  //     .set("lastName", data.lastName)
  //     .set("streetAddress", data.streetAddress)
  //     .set("city", data.city)
  //     .set("state", data.state)
  //     .set("zip", data.zip)
  //     .set("telephoneNumber", data.telephoneNumber)
  //     .set("email", data.email)
  //     .set("dateOfSurvey", data.dateOfSurvey)
  //     .set("likedStudents", data.likedStudents)
  //     .set("likedLocation", data.likedLocation)
  //     .set("likedCampus", data.likedCampus)
  //     .set("likedAtmosphere", data.likedAtmosphere)
  //     .set("likedDormRooms", data.likedDormRooms)
  //     .set("likedSports", data.likedSports)
  //     .set("interestedBy", data.interestedBy)
  //     .set("schoolRecommendation", data.schoolRecommendation)
  //     .set("raffleEntry", data.raffleEntry)
  //     .set("additionalComments", data.additionalComments);
  // }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    return alert("Something bad happened; please try again later.");
  }
}
