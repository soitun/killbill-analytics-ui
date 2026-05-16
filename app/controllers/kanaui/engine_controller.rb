# frozen_string_literal: true

module Kanaui
  class EngineController < ApplicationController
    layout :get_layout

    def get_layout
      layout ||= Kanaui.config[:layout]
    end

    def current_tenant_user
      # If the rails application on which that engine is mounted defines such method (Devise), we extract the current user,
      # if not we default to nil, and serve our static mock configuration
      user = current_user if respond_to?(:current_user)
      Kanaui.current_tenant_user.call(session, user)
    end

    def options_for_klient
      user = current_tenant_user
      {
        username: user[:username],
        password: user[:password],
        session_id: user[:session_id],
        api_key: user[:api_key],
        api_secret: user[:api_secret]
      }
    end

    rescue_from(KillBillClient::API::ResponseError) do |killbill_exception|
      error_message = I18n.t('kanaui.errors.killbill_communication', error: as_string(killbill_exception))

      if json_request?
        render json: { message: error_message }, status: killbill_exception.response.code.to_i
      else
        flash[:error] = error_message
        # Avoid redirect loops when the dashboard itself cannot be loaded.
        if controller_name == 'dashboard' && action_name == 'index'
          render plain: error_message, status: killbill_exception.response.code.to_i
        else
          redirect_to dashboard_index_path
        end
      end
    end

    def json_request?
      request.format.json? || params[:format] == 'json' || dashboard_reports_json_request?
    end

    def dashboard_reports_json_request?
      controller_name == 'dashboard' && action_name == 'reports' && params[:format].blank?
    end

    def as_string(e)
      if e.is_a?(KillBillClient::API::ResponseError)
        "Error #{e.response.code}: #{as_string_from_response(e.response.body)}"
      else
        log_rescue_error(e)
        e.message
      end
    end

    def log_rescue_error(error)
      Rails.logger.warn "#{error.class} #{error}. #{error.backtrace.join("\n")}"
    end

    def as_string_from_response(response)
      error_message = response
      begin
        # BillingExceptionJson?
        error_message = JSON.parse response
      rescue StandardError => _e
      end

      if error_message.respond_to?(:[]) && error_message['message'].present?
        # Likely BillingExceptionJson
        error_message = error_message['message']
      end
      # Limit the error size to avoid ActionDispatch::Cookies::CookieOverflow
      error_message[0..1000]
    end
  end
end
