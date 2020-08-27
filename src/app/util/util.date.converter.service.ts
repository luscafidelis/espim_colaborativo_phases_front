import * as moment from 'moment';
import { NgbDate, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from "@angular/core";

@Injectable()
export class DateConverterService {
    toNgbDate(date: string | Date): NgbDate{
        let tempDate: Date;

        if (date instanceof Date) tempDate = date;
        else moment(date, 'YYYY-MM-DD').toDate();

        return new NgbDate(tempDate.getFullYear(), tempDate.getMonth() + 1, tempDate.getDate());
    }

    toNgbTime(date: Date): NgbTimeStruct {
        return {
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds()
        };
    }

    toString(ngbDate: NgbDate, ngbTime?: NgbTimeStruct): string{
        return moment(new Date(ngbDate.year, ngbDate.month, ngbDate.day)).format('YYYY-MM-DD').toString()
    }

    toUnixTimeStamp(ngbDate: NgbDate, ngbTime?: NgbTimeStruct): string {
        return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day, ngbTime.hour, ngbTime.minute, ngbTime.second).getTime().toString();
    }

    fromUnixTimeStamp(uts: number): Date {
        return moment(uts).toDate();
    }
}
