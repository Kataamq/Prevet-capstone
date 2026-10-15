from django.urls import path

from . import calendario, views

urlpatterns = [
    path('', views.listado, name='citas'),
    path('nueva/', views.agendar, name='agendar'),
    path('<int:pk>/no-asistio/', views.marcar_no_asistio, name='marcar_no_asistio'),

    path('calendario/', calendario.calendario, name='calendario'),
    path('calendario/eventos/', calendario.eventos, name='calendario_eventos'),
    path('<int:pk>/detalle/', calendario.detalle, name='cita_detalle'),
    path('<int:pk>/llego/', calendario.marcar_llegada, name='cita_llego'),
    path('<int:pk>/atendida/', calendario.marcar_atendida, name='cita_atendida'),
    path('<int:pk>/cancelar/', calendario.cancelar, name='cita_cancelar'),
    path('<int:pk>/reagendar/', calendario.reagendar, name='cita_reagendar'),
]
