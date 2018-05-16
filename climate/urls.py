from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='climate_index'),
	url(r'^transfer/(?P<url>.*)$', views.transfer),
]