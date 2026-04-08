# frozen_string_literal: true

Kanaui::Engine.routes.draw do
  root to: 'dashboard#index'
  resources :dashboard, only: [:index]
  scope '/dashboard' do
    get '/available_reports' => 'dashboard#available_reports', :as => 'available_reports'
    get '/reports' => 'dashboard#reports', :as => 'reports'
  end

  resources :reports, only: %i[index new create edit update destroy]
  scope '/reports' do
    put '/refresh/:id' => 'reports#refresh', :as => 'refresh_report'
  end

  resources :settings, only: %i[index create]
end
