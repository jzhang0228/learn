from django.conf.urls import url

from .views import LessonsView, LessonView, EditView, UploadAudio

urlpatterns = [
    url(r'^add/$', EditView.as_view(), name='edit_lesson'),
    url(r'^edit/(\d+)/$', EditView.as_view(), name='edit_lesson'),
    url(r'^upload_audio/(\d+)/$', UploadAudio.as_view(), name='upload_audio'),
    url(r'^(\d+)/$', LessonView.as_view(), name='lesson'),
    url(r'^$', LessonsView.as_view(), name='lessons'),
]
