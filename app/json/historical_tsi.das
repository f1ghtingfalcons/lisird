attributes {
    TimeSeries {
        string title "Historical TSI Reconstruction";
        int32 length 403;
        time {
            string long_name "Year";
            string units "years since 0000-01-01";
            string resolution "P1Y";
            string precision "1";
        }
        Irradiance {
            string long_name "Total Solar Irradiance";
            string units "W/m^2";
            float64 missing_value NaN;
            string precision "4";
        }
    }
}