import * as moment from 'moment';
import { NgbDate, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from "@angular/core";

@Injectable()
export class DateConverterService {
    DELIMITER = "/";
    
    toNgbDate(date: string | Date): NgbDateStruct{
        let tempDate: Date;

        if (date instanceof Date) 
          tempDate = date;
        else 
          tempDate = moment(date, 'YYYY-MM-DD').toDate();

        return {
            day : parseInt(tempDate!.getDate().toString()),
            month : parseInt(tempDate!.getMonth().toString()),
            year : parseInt(tempDate!.getFullYear().toString())
          };
    }

    toStrDate(date: Date): string{
      if (date != null) {
        return this.toString({
            day : parseInt(date!.getDate().toString()),
            month : parseInt(date!.getMonth().toString()),
            year : parseInt(date!.getFullYear().toString())
        });
      }
      return '';
    }

    toNgbTime(date: Date): NgbTimeStruct {
        return {
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds()
        };
    }

    toString(date: NgbDateStruct): string{
        return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
        //return moment(new Date(ngbDate.year, ngbDate.month, ngbDate.day)).format('YYYY-MM-DD').toString()
    }

    toUnixTimeStamp(ngbDate: NgbDateStruct, ngbTime: NgbTimeStruct): string {
        return new Date(ngbDate.year, ngbDate.month, ngbDate.day, ngbTime.hour, ngbTime.minute, ngbTime.second).getTime().toString();
    }

    fromUnixTimeStamp(uts: number): Date {
        return moment(uts).toDate();
    }

    parse(value: string): NgbDateStruct{
      if (value) {
        const date = value.split(this.DELIMITER);
        return {
          day : parseInt(date[0], 10),
          month : parseInt(date[1], 10),
          year : parseInt(date[2], 10)
        };
      }
      return {day: 1, month: 1, year: 2000};
    }
}


@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '/';

  fromModel(value: string | null): NgbDateStruct | null {
    let locValue = value?.toString()
    if (locValue !=  null ) {
      const date = locValue.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
  }
}

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct{
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return {day: 1, month: 1, year: 2000};
  }

  format(date: NgbDateStruct | null): string {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
  }
}