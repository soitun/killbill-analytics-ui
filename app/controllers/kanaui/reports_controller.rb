# frozen_string_literal: true

module Kanaui
  class ReportsController < Kanaui::EngineController
    def index
      @reports = JSON.parse(Kanaui::DashboardHelper::DashboardApi.available_reports(options_for_klient)).map(&:deep_symbolize_keys)
      @report_notice = report_notice_from_flash
    end

    def new
      @report = {}
    end

    def edit
      @report = JSON.parse(Kanaui::DashboardHelper::DashboardApi.available_reports(options_for_klient))
                    .find { |x| x['reportName'] == params.require(:id) }
                    .deep_symbolize_keys
    end

    def create
      Kanaui::DashboardHelper::DashboardApi.create_report(report_from_params.to_json, options_for_klient)

      redirect_to_index_with_notice(:created)
    end

    def update
      Kanaui::DashboardHelper::DashboardApi.update_report(params.require(:id), report_from_params.to_json, options_for_klient)

      redirect_to_index_with_notice(:updated)
    end

    def refresh
      Kanaui::DashboardHelper::DashboardApi.refresh_report(params.require(:id), options_for_klient)

      redirect_to_index_with_notice(:refresh_scheduled)
    end

    def destroy
      Kanaui::DashboardHelper::DashboardApi.delete_report(params.require(:id), options_for_klient)

      redirect_to_index_with_notice(:deleted)
    end

    private

    def report_notice_from_flash
      notice_key = flash[:report_notice].presence&.to_s
      return nil unless %w[created updated refresh_scheduled deleted].include?(notice_key)

      I18n.t("kanaui.reports.notices.#{notice_key}", default: nil)
    end

    def redirect_to_index_with_notice(notice_key)
      flash[:report_notice] = notice_key
      redirect_to action: :index
    end

    def report_from_params
      {
        reportName: params[:report_name],
        reportPrettyName: params[:report_pretty_name],
        reportType: params[:report_type],
        sourceTableName: params[:source_table_name],
        sourceName: params[:source_name],
        sourceQuery: params[:source_query],
        refreshProcedureName: params[:refresh_procedure_name],
        refreshFrequency: params[:refresh_frequency].presence,
        refreshHourOfDayGmt: params[:refresh_hour_of_day_gmt]
      }
    end
  end
end
