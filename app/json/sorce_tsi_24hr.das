attributes {
    TimeSeries {
        string title "SORCE Total Solar Irradiance - Daily Average";
        int32 length 3926;
        time {
            string long_name "Nominal Time";
            string units "Julian Date";
            string resolution "PT1D";
            string format "%11.3f";
        }
        tsi_1au {
            string long_name "Total Solar Irradiance (TSI) at 1-AU";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.4f";
        }
        instrument_accuracy_1au {
            string long_name "Instrument Accuracy in 1-AU TSI, 1 sigma";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.3e";
        }
        instrument_precision_1au {
            string long_name "Instrument Precision in TSI at 1-AU, 1 sigma";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.3e";
        }
        solar_standard_deviation_1au {
            string long_name "Solar Standard Deviation in 1-AU TSI, 1 sigma";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.3e";
        }
        measurement_uncertainty_1au {
            string long_name "Total Uncertainty in TSI at 1-AU, 1 sigma";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.3e";
        }
        tsi_true_earth {
            string long_name "Total Solar Irradiance at Earth distance";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.4f";
        }
        instrument_accuracy_true_earth {
            string long_name "Instrument Accuracy at Earth distance, 1 sigma";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.3e";
        }
        instrument_precision_true_earth {
            string long_name "Instrument Precision at Earth distance, 1 sigma";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.3e";
        }
        solar_standard_deviation_true_earth {
            string long_name "Solar Standard Deviation in TSI at Earth, 1 sigma";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.3e";
        }
        measurement_uncertainty_true_earth {
            string long_name "Total Uncertainty in TSI at Earth distance, 1 sigma";
            string units "W/m^2";
            string missing_value "0";
            string format "%9.3e";
        }
        avg_measurement_date {
            string long_name "Average Data Time";
            string units "Julian Date";
            string missing_value "0";
            string format "%14.6f";
        }
        std_dev_measurement_date {
            string long_name "Stdev of Average Data Time, 1 sigma";
            string units "days";
            string missing_value "0";
            string format "%6.4f";
        }
    }
}